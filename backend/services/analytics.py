import io
import pandas as pd
import numpy as np
from typing import Dict, Any
from fastapi import HTTPException
from utils.normalization import normalize_column_name, normalize_status
from utils.config import (
    ACTIVE_STATUSES, HOLD_STATUSES, REJECTED_STATUSES, 
    OFFERED_STATUSES, JOINED_STATUSES, DUPLICATE_STATUSES,
    STATUS_PRIORITY
)

def process_excel(file_content: bytes) -> Dict[str, Any]:
    try:
        df = pd.read_excel(io.BytesIO(file_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to parse Excel file. It might be corrupt or invalid.")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded Excel file is empty.")

    df.columns = [normalize_column_name(col) for col in df.columns]

    if len(df.columns) == 0:
        raise HTTPException(status_code=400, detail="No readable columns found in the file.")

    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].apply(normalize_status)

    # 1. Handle Duplicates First
    duplicate_mask = pd.Series([False] * len(df))
    for col in df.columns:
        duplicate_mask = duplicate_mask | df[col].astype(str).str.contains('duplicate', case=False, na=False)
    
    duplicate_profiles = int(duplicate_mask.sum())
    
    # Remove duplicates from further analysis
    df = df[~duplicate_mask].copy()
    total_candidates = len(df)

    # 2. Row-by-row state resolution via vectorized masks

    def text_in_any_col(text_list):
        """Search for any of the given strings across ALL columns."""
        mask = pd.Series([False] * len(df), index=df.index)
        for col in df.columns:
            for text in text_list:
                mask = mask | df[col].astype(str).str.contains(text, case=False, na=False)
        return mask

    def text_in_col(col_name, text_list):
        """Search for any of the given strings in ONE specific column only."""
        if col_name not in df.columns:
            return pd.Series([False] * len(df), index=df.index)
        mask = pd.Series([False] * len(df), index=df.index)
        for text in text_list:
            mask = mask | df[col_name].astype(str).str.contains(text, case=False, na=False)
        return mask

    # Bug Fix 1: Active Pipeline — must only check 'l1 interview' column.
    # "Shortlisted in L1" is L1-specific; the other statuses also live in L1.
    # Using text_in_any_col would incorrectly count candidates shortlisted in L2/L3.
    active_mask = text_in_col('l1 interview', [
        'shortlisted',
        'interview yet to be schedule',
        'interview schedule',  # matches "Interview schedule on 7 May 2026"
        'feedback pending',
    ])

    # Hold: "hold" in any stage column
    hold_mask = text_in_any_col(['hold'])

    # Rejected: dropped, no response, not interested, rejected — any column
    rejected_mask = text_in_any_col(['dropped', 'no response', 'not interested', 'rejected'])

    # Bug Fix 2: Offered — after normalize_status, empty/null are already None so notna() is
    # the right guard. Also cast to str and strip to handle any residual 'none'/'null' strings.
    offered_mask = pd.Series([False] * len(df), index=df.index)
    if 'offered' in df.columns:
        offered_mask = (
            df['offered'].notna()
            & (df['offered'].astype(str).str.strip().str.lower().isin(['', 'none', 'null', 'nan']) == False)
        )

    # Joined: only "joined" in any column.
    # "position closed" candidates are counted in total_candidates but excluded from all KPIs.
    joined_mask = text_in_any_col(['joined'])

    df['final_state'] = None
    # Apply in reverse priority order (Lowest to Highest)
    df.loc[active_mask, 'final_state'] = 'active'
    df.loc[hold_mask, 'final_state'] = 'hold'
    df.loc[rejected_mask, 'final_state'] = 'rejected'
    df.loc[offered_mask, 'final_state'] = 'offered'
    df.loc[joined_mask, 'final_state'] = 'joined'

    # 3. KPI Calculations
    active_pipeline = int((df['final_state'] == 'active').sum())
    hold = int((df['final_state'] == 'hold').sum())
    rejected = int((df['final_state'] == 'rejected').sum())
    offered_count = int((df['final_state'] == 'offered').sum())
    joined_count = int((df['final_state'] == 'joined').sum())
    
    # Positions Closed: unique (company, role) pairs affected by closure or drive cancellation.
    # Bug Fix 4: was doing .sum() on rows — inflates count by candidates-per-role.
    positions_closed_mask = text_in_any_col(['position closed', 'drive cancelled'])
    if 'company' in df.columns and 'company role' in df.columns:
        positions_closed = int(
            df[positions_closed_mask][['company', 'company role']]
            .drop_duplicates()
            .shape[0]
        )
    else:
        positions_closed = int(positions_closed_mask.sum())

    # 4. Funnel Logic
    l1_cleared = 0
    if 'l2 interview' in df.columns:
        l1_cleared = int(df['l2 interview'].notna().sum())
        
    l2_cleared = 0
    if 'l3 interview' in df.columns:
        l2_cleared = int(df['l3 interview'].notna().sum())
        
    l3_cleared = 0
    if 'l3 interview' in df.columns:
        l3_cleared = int(df['l3 interview'].astype(str).str.contains('shortlisted', case=False, na=False).sum())

    offered_funnel = int(df['final_state'].isin(['offered', 'joined']).sum())

    funnel = [
        {"stage": "Total Submitted", "count": int(total_candidates)},
        {"stage": "L1 Cleared", "count": int(l1_cleared)},
        {"stage": "L2 Cleared", "count": int(l2_cleared)},
        {"stage": "L3 Cleared", "count": int(l3_cleared)},
        {"stage": "Offered", "count": int(offered_funnel)},
        {"stage": "Joined", "count": int(joined_count)}
    ]

    # 5. Company Distribution Logic
    # Bug Fix 3: 'company role' column holds the ROLE name (e.g. "SSE"), not the company.
    # After normalization, Excel's "Role" column maps to canonical "company role", and
    # "Company" maps to "company". Using df['company role'].value_counts() was returning
    # the top role ("SSE") as the top company — plainly wrong.
    # Top company → df['company']; Total unique roles → df['company role'].nunique()
    total_roles = 0
    top_company_name = "N/A"
    top_company_candidates = 0

    if 'company role' in df.columns:
        total_roles = int(df['company role'].nunique())

    if 'company' in df.columns:
        company_counts = df['company'].value_counts()
        if not company_counts.empty:
            top_company_name = str(company_counts.index[0]).title()
            top_company_candidates = int(company_counts.iloc[0])

    company_distribution = {
        "topCompany": top_company_name,
        "totalCandidates": int(total_candidates),
        "totalRoles": int(total_roles)
    }

    return {
        "kpis": {
            "totalCandidates": int(total_candidates),
            "activePipeline": int(active_pipeline),
            "hold": int(hold),
            "rejected": int(rejected),
            "offered": int(offered_count),
            "joined": int(joined_count),
            "positionsClosed": int(positions_closed),
            "duplicateProfiles": int(duplicate_profiles)
        },
        "funnel": funnel,
        "companyDistribution": company_distribution
    }