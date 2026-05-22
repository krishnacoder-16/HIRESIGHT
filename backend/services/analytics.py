import io
import pandas as pd
import numpy as np
from typing import Dict, Any
from fastapi import HTTPException
from utils.normalization import normalize_column_name, normalize_status
from utils.config import (
    ACTIVE_STATUSES, HOLD_STATUSES, REJECTED_STATUSES, 
    OFFERED_STATUSES, JOINED_STATUSES, DUPLICATE_STATUSES
)

def process_excel(file_content: bytes) -> Dict[str, Any]:
    try:
        # Load excel file into pandas dataframe
        df = pd.read_excel(io.BytesIO(file_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to parse Excel file. It might be corrupt or invalid.")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded Excel file is empty.")

    # Normalize column names
    df.columns = [normalize_column_name(col) for col in df.columns]

    if len(df.columns) == 0:
        raise HTTPException(status_code=400, detail="No readable columns found in the file.")

    # Normalize all string columns
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].apply(normalize_status)

    # 1. Total Candidates
    total_candidates = len(df)

    def column_has_status(col_name: str, status_list: list) -> pd.Series:
        if col_name not in df.columns:
            return pd.Series([False] * len(df))
        return df[col_name].isin(status_list)

    def any_column_has_status(columns: list, status_list: list) -> pd.Series:
        mask = pd.Series([False] * len(df))
        for col in columns:
            mask = mask | column_has_status(col, status_list)
        return mask

    status_columns = ['l1 interview', 'l2 interview', 'l3 interview', 'final feedback', 'offered', 'joining status']
    existing_status_cols = [col for col in status_columns if col in df.columns]

    # 2. Active Pipeline
    active_pipeline = int(any_column_has_status(existing_status_cols, ACTIVE_STATUSES).sum())

    # 3. Hold
    hold = int(any_column_has_status(existing_status_cols, HOLD_STATUSES).sum())

    # 4. Rejected
    rejected = int(any_column_has_status(existing_status_cols, REJECTED_STATUSES).sum())

    # 5. Offered
    offered_mask = column_has_status('offered', OFFERED_STATUSES)
    joined_mask = column_has_status('joining status', JOINED_STATUSES)
    offered = int((offered_mask & ~joined_mask).sum())

    # 6. Joined
    joined = int(joined_mask.sum())

    # 7. Duplicate Profiles
    duplicate_profiles = int(any_column_has_status(existing_status_cols, DUPLICATE_STATUSES).sum())

    # 8. Positions Closed (unique roles where joined)
    positions_closed = 0
    if 'company role' in df.columns and 'joining status' in df.columns:
        joined_df = df[joined_mask]
        positions_closed = int(joined_df['company role'].nunique())

    # FUNNEL LOGIC
    # Simplified proxy for MVP: if a column has a non-null status, they reached that stage.
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

    # TOP COMPANIES LOGIC
    top_companies = []
    if 'company role' in df.columns:
        counts = df['company role'].value_counts().head(5)
        for company, count in counts.items():
            if pd.notna(company):
                top_companies.append({
                    "company": str(company).title(),
                    "count": int(count)
                })

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
        "topCompanies": top_companies
    }
