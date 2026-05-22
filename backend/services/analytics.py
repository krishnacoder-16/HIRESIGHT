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

    total_candidates = len(df)

    # 1. Row-by-row state resolution
    def resolve_candidate_final_state(row):
        best_status = None
        best_priority = 999
        
        # Priority order of columns to check
        columns_to_check = [
            'joining status', 'offered', 'final feedback', 
            'l3 interview', 'l2 interview', 'l1 interview'
        ]
        
        for col in columns_to_check:
            if col in row.index and pd.notna(row[col]):
                status = str(row[col]).strip().lower()
                if status == '' or status in ('nan', 'nat', 'null', 'none'):
                    continue
                    
                priority = STATUS_PRIORITY.get(status, 999)
                if priority < best_priority:
                    best_priority = priority
                    best_status = status
                    
        return best_status

    df['final_state'] = df.apply(resolve_candidate_final_state, axis=1)

    # 2. KPI Calculations based on final_state
    active_pipeline = int(df['final_state'].isin(ACTIVE_STATUSES).sum())
    hold = int(df['final_state'].isin(HOLD_STATUSES).sum())
    rejected = int(df['final_state'].isin(REJECTED_STATUSES).sum())
    offered = int(df['final_state'].isin(OFFERED_STATUSES).sum())
    joined = int(df['final_state'].isin(JOINED_STATUSES).sum())
    
    # 3. Duplicate Profiles (we check all existing status columns for the word 'duplicate')
    status_columns = ['l1 interview', 'l2 interview', 'l3 interview', 'final feedback', 'offered', 'joining status']
    existing_status_cols = [col for col in status_columns if col in df.columns]
    
    def column_has_status(col_name: str, status_list: list) -> pd.Series:
        if col_name not in df.columns:
            return pd.Series([False] * len(df))
        return df[col_name].isin(status_list)

    def any_column_has_status(columns: list, status_list: list) -> pd.Series:
        mask = pd.Series([False] * len(df))
        for col in columns:
            mask = mask | column_has_status(col, status_list)
        return mask

    duplicate_profiles = int(any_column_has_status(existing_status_cols, DUPLICATE_STATUSES).sum())

    # 4. Positions Closed (Unique roles where candidate final_state is Joined)
    positions_closed = 0
    if 'company role' in df.columns:
        joined_df = df[df['final_state'].isin(JOINED_STATUSES)]
        positions_closed = int(joined_df['company role'].nunique())

    # 5. Funnel Logic
    l1_cleared = 0
    if 'l2 interview' in df.columns:
        l1_cleared = int(df['l2 interview'].notna().sum())
        
    l2_cleared = 0
    if 'l3 interview' in df.columns:
        l2_cleared = int(df['l3 interview'].notna().sum())
        
    l3_cleared = 0
    if 'final feedback' in df.columns:
        l3_cleared = int(df['final feedback'].notna().sum())

    funnel = [
        {"stage": "Total Submitted", "count": int(total_candidates)},
        {"stage": "L1 Cleared", "count": int(l1_cleared)},
        {"stage": "L2 Cleared", "count": int(l2_cleared)},
        {"stage": "L3 Cleared", "count": int(l3_cleared)},
        {"stage": "Offered", "count": int(offered)},
        {"stage": "Joined", "count": int(joined)}
    ]

    # 6. Company Distribution Logic
    total_roles = 0
    top_company_name = "N/A"
    top_company_candidates = 0

    if 'company role' in df.columns:
        total_roles = int(df['company role'].nunique())
        
        counts = df['company role'].value_counts()
        if not counts.empty:
            top_company_name = str(counts.index[0]).title()
            top_company_candidates = int(counts.iloc[0])

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
            "offered": int(offered),
            "joined": int(joined),
            "positionsClosed": int(positions_closed),
            "duplicateProfiles": int(duplicate_profiles)
        },
        "funnel": funnel,
        "companyDistribution": company_distribution
    }
