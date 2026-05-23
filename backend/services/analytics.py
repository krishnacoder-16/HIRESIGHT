import io
import pandas as pd
import numpy as np
from typing import Dict, Any
from fastapi import HTTPException
from utils.normalization import normalize_column_name, normalize_status
from utils.config import (
    ACTIVE_STATUSES, HOLD_STATUSES, REJECTED_STATUSES,
    OFFERED_STATUSES, JOINED_STATUSES, DUPLICATE_STATUSES,
    STATUS_PRIORITY, WORKFLOW_STAGE_COLUMNS
)


def _is_string_like_dtype(dtype) -> bool:
    """Return True for object and StringDtype columns (both hold text data)."""
    if hasattr(dtype, 'name') and dtype.name == 'object':
        return True
    # pandas StringDtype (pandas >= 1.0) has a .name of 'string'
    if hasattr(dtype, 'name') and dtype.name == 'string':
        return True
    # pandas >= 2.0 ArrowDtype for string
    if hasattr(dtype, 'pyarrow_dtype'):
        import pyarrow as pa
        return pa.types.is_string(dtype.pyarrow_dtype) or pa.types.is_large_string(dtype.pyarrow_dtype)
    return False


def _get_workflow_value(row, col: str):
    # Try exact match first
    if col in row:
        val = row[col]
        if val is not None and not pd.isna(val):
            return val
    # Then try normalized
    norm_col = normalize_column_name(col)
    if norm_col in row:
        val = row[norm_col]
        if val is not None and not pd.isna(val):
            return val
    # Try direct lowercase
    lower_col = col.lower().strip()
    if lower_col in row:
        val = row[lower_col]
        if val is not None and not pd.isna(val):
            return val
    return None


def is_duplicate(row) -> bool:
    columns = [
        "Final Feedback",
        "Joining Status",
        "L3 Interview",
        "L2 Interview",
        "L1 Interview"
    ]
    for col in columns:
        val = _get_workflow_value(row, col)
        if val is not None:
            val_str = str(val).strip().lower()
            if "duplicate" in val_str:
                return True
    return False


def is_joined(row) -> bool:
    if is_duplicate(row):
        return False
    columns = [
        "Final Feedback",
        "Joining Status",
        "L3 Interview",
        "L2 Interview",
        "L1 Interview"
    ]
    # Check for "joined"
    has_joined = False
    for col in columns:
        val = _get_workflow_value(row, col)
        if val is not None:
            val_str = str(val).strip().lower()
            if "joined" in val_str:
                has_joined = True
                break
                
    if not has_joined:
        return False
        
    # Check for exclusions
    for col in columns:
        val = _get_workflow_value(row, col)
        if val is not None:
            val_str = str(val).strip().lower()
            if any(kw in val_str for kw in ['not joined', 'did not join', "didn't join", 'decline']):
                return False
                
    return True


def is_position_closed(row) -> bool:
    if is_duplicate(row):
        return False
    columns = [
        "Final Feedback",
        "Joining Status",
        "L3 Interview",
        "L2 Interview",
        "L1 Interview"
    ]
    for col in columns:
        val = _get_workflow_value(row, col)
        if val is not None:
            val_str = str(val).strip().lower()
            if "position closed" in val_str or "position_closed" in val_str:
                return True
    return False


def is_drive_cancelled(row) -> bool:
    if is_duplicate(row):
        return False
    columns = [
        "Final Feedback",
        "Joining Status",
        "L3 Interview",
        "L2 Interview",
        "L1 Interview"
    ]
    for col in columns:
        val = _get_workflow_value(row, col)
        if val is not None:
            val_str = str(val).strip().lower()
            if "drive cancelled" in val_str or "drive_cancelled" in val_str:
                return True
    return False


def is_rejected(row) -> bool:
    if is_duplicate(row):
        return False
    if is_drive_cancelled(row) or is_position_closed(row):
        return False
        
    columns = [
        "Final Feedback",
        "Joining Status",
        "L3 Interview",
        "L2 Interview",
        "L1 Interview"
    ]
    rejection_keywords = [
        'dropped', 'no response', 'not interested', 'rejected', 'not join', 'did not join',
        'salary expectation not matched', 'salary mismatch', 'got another offer', 'another offer', 'decline'
    ]
    for col in columns:
        val = _get_workflow_value(row, col)
        if val is not None:
            val_str = str(val).strip().lower()
            if any(kw in val_str for kw in rejection_keywords):
                return True
    return False


def is_offered(row) -> bool:
    if is_duplicate(row):
        return False
    if is_joined(row) or is_rejected(row):
        return False
        
    # Check Offered column if present
    offered_keys = ["offered", "offer status", "offer"]
    for key in offered_keys:
        if key in row:
            val = row[key]
            if val is not None and not pd.isna(val):
                val_str = str(val).strip().lower()
                if val_str and val_str not in ('nan', 'nat', 'null', 'none', 'no', 'false'):
                    return True
                    
    return False


def is_hold(row) -> bool:
    if is_duplicate(row):
        return False
    if is_rejected(row) or is_joined(row) or is_offered(row) or is_drive_cancelled(row) or is_position_closed(row):
        return False
        
    columns = [
        "Final Feedback",
        "Joining Status",
        "L3 Interview",
        "L2 Interview",
        "L1 Interview"
    ]
    for col in columns:
        val = _get_workflow_value(row, col)
        if val is not None:
            val_str = str(val).strip().lower()
            if "hold" in val_str:
                return True
    return False


def is_active_pipeline(row) -> bool:
    if is_duplicate(row):
        return False
    if is_rejected(row) or is_joined(row) or is_hold(row) or is_offered(row) or is_drive_cancelled(row) or is_position_closed(row):
        return False
        
    val = _get_workflow_value(row, "L1 Interview")
    if val is not None:
        val_str = str(val).strip().lower()
        active_keywords = [
            'shortlisted',
            'shortlist',
            'interview yet to be schedule',
            'interview schedule',
            'feedback pending',
        ]
        if any(kw in val_str for kw in active_keywords):
            return True
            
    return False


def process_excel(file_content: bytes) -> Dict[str, Any]:
    try:
        df = pd.read_excel(io.BytesIO(file_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to parse Excel file. It might be corrupt or invalid.")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded Excel file is empty.")

    # Normalize column names (lowercase, trim, map aliases)
    df.columns = [normalize_column_name(col) for col in df.columns]

    # Filter out empty rows or rows without a candidate name
    if "candidate" in df.columns:
        df = df[df["candidate"].notna() & (df["candidate"].astype(str).str.strip() != "")]
    
    df_raw = df.copy()

    if len(df.columns) == 0:
        raise HTTPException(status_code=400, detail="No readable columns found in the file.")

    # Normalize all string-typed cell values (lowercase, trim, null-safe)
    # Handles both 'object' and pandas StringDtype columns
    for col in df.columns:
        if _is_string_like_dtype(df[col].dtype):
            df[col] = df[col].apply(normalize_status)

    # 1. Handle Duplicates First
    duplicate_mask = pd.Series([False] * len(df), index=df.index)
    for col in df.columns:
        duplicate_mask = duplicate_mask | df[col].astype(str).str.contains('duplicate', case=False, na=False)
    
    duplicate_profiles = int(duplicate_mask.sum())
    total_candidates = len(df) # Exact raw candidate count (483)

    # Remove duplicates from further analysis
    df = df[~duplicate_mask].copy()

    # 2. Row-by-row state resolution via independent vectorized masks

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

    # 2.1 Positions Closed and Drive Cancelled masks
    drive_cancelled_mask = text_in_any_col(['drive cancelled', 'drive_cancelled'])
    position_closed_mask = text_in_any_col(['position closed', 'position_closed'])

    # 2.2 Joined: only "joined" in any column, but excluding "not joined" / "decline" / etc.
    joined_mask = text_in_any_col(['joined']) & ~text_in_any_col(['not joined', 'did not join', "didn't join", 'decline'])

    # 2.3 Rejected: dropped, no response, not interested, rejected, decline, salary mismatch, another offer — any column
    # Explicitly exclude drive cancelled and position closed candidates as per user request
    rejection_keywords = [
        'dropped', 'no response', 'not interested', 'rejected', 'not join', 'did not join',
        'salary expectation not matched', 'salary mismatch', 'got another offer', 'another offer', 'decline'
    ]
    rejected_mask = text_in_any_col(rejection_keywords) & ~drive_cancelled_mask & ~position_closed_mask

    # 2.4 Offered — offered column not empty/null. Exclude joined and rejected to get active offers.
    offered_mask = pd.Series([False] * len(df), index=df.index)
    if 'offered' in df.columns:
        offered_mask = (
            df['offered'].notna()
            & (df['offered'].astype(str).str.strip().str.lower().isin(['', 'none', 'null', 'nan']) == False)
        )
    offered_mask = offered_mask & ~joined_mask & ~rejected_mask

    # 2.5 Hold: hold keywords in any column, excluding active/joined/offered/rejected/cancelled/closed outcomes
    hold_mask = text_in_any_col(['hold']) & ~rejected_mask & ~joined_mask & ~offered_mask & ~drive_cancelled_mask & ~position_closed_mask

    # 2.6 Active Pipeline: only 'l1 interview' column contains active keywords
    active_mask = text_in_col('l1 interview', [
        'shortlisted',
        'shortlist',
        'interview yet to be schedule',
        'interview schedule',
        'feedback pending',
    ])
    # Exclude finalized or paused outcomes from active pipeline
    active_mask = active_mask & ~rejected_mask & ~joined_mask & ~hold_mask & ~offered_mask & ~drive_cancelled_mask & ~position_closed_mask

    # 3. KPI Calculations
    active_pipeline = int(active_mask.sum())
    hold = int(hold_mask.sum())
    rejected = int(rejected_mask.sum())
    offered_count = int(offered_mask.sum())
    joined_count = int(joined_mask.sum())
    positions_closed = int((drive_cancelled_mask | position_closed_mask | joined_mask).sum())

    # 4. Funnel Logic
    l1_cleared = 0
    if 'l1 interview' in df.columns:
        l1_cleared = int(df['l1 interview'].astype(str).str.contains('shortlisted|shortlist', case=False, na=False).sum())
        
    l2_cleared = 0
    if 'l2 interview' in df.columns:
        l2_cleared = int(df['l2 interview'].astype(str).str.contains('shortlisted|shortlist', case=False, na=False).sum())
        
    l3_cleared = 0
    if 'l3 interview' in df.columns:
        l3_cleared = int(df['l3 interview'].astype(str).str.contains('shortlisted|shortlist', case=False, na=False).sum())

    offered_funnel = int((joined_mask | offered_mask).sum())

    funnel = [
        {"stage": "Total Submitted", "count": int(total_candidates)},
        {"stage": "L1 Cleared", "count": int(l1_cleared)},
        {"stage": "L2 Cleared", "count": int(l2_cleared)},
        {"stage": "L3 Cleared", "count": int(l3_cleared)},
        {"stage": "Offered", "count": int(offered_funnel)},
        {"stage": "Joined", "count": int(joined_count)}
    ]

    # 5. Company Distribution Logic
    total_roles = 0
    top_company_name = "N/A"
    top_company_candidates = 0
    top_companies_list = []

    if 'company role' in df.columns:
        total_roles = int(df['company role'].nunique())

    source_df = df_raw if 'df_raw' in locals() else df

    if 'company' in source_df.columns:
        def standardize_co(name):
            if not isinstance(name, str):
                return "N/A"
            name_clean = name.strip()
            name_lower = name_clean.lower()
            if name_lower == 'ivp':
                return 'IVP'
            if name_lower == 'hcl':
                return 'HCL'
            if name_lower == 'jkt':
                return 'JKT'
            if name_lower == 'spac':
                return 'SPAC'
            if name_lower == 'pkf':
                return 'PKF'
            return name_clean.title()

        raw_companies = source_df['company'].dropna().apply(standardize_co)
        counts = raw_companies.value_counts()
        if not counts.empty:
            top_company_name = str(counts.index[0])
            top_company_candidates = int(counts.iloc[0])
            
        for co, count in counts.head(5).items():
            top_companies_list.append({
                "company": str(co),
                "count": int(count)
            })

    company_distribution = {
        "topCompany": top_company_name,
        "totalCandidates": int(total_candidates),
        "totalRoles": int(total_roles),
        "topCompanies": top_companies_list
    }

    # === POPULATE CANDIDATE PIPELINE STORE ===
    import services.store as store
    
    # Store raw dataframe for any future KPI reference
    store.state["raw_dataframe"] = df_raw.copy()

    # Create candidate_dataframe (deduplicated)
    cand_df = df_raw.copy()
    
    # Safe cleanup function
    def clean_col_for_dedup(col_series):
        # convert to string, strip whitespace, lowercase
        s = col_series.astype(str).str.strip().str.lower()
        # replace common null string representations with empty string
        s = s.replace({'nan': '', 'none': '', 'null': '', 'nat': ''})
        return s

    # Create temporary normalized columns for deduplication
    dedup_cols_map = {
        'email id': '_dedup_email',
        'phone number': '_dedup_phone',
        'company': '_dedup_company',
        'company role': '_dedup_role'
    }
    
    for orig_col, tmp_col in dedup_cols_map.items():
        if orig_col in cand_df.columns:
            cand_df[tmp_col] = clean_col_for_dedup(cand_df[orig_col])
        else:
            cand_df[tmp_col] = ''

    def dedup_by_subset(df_subset, primary_tmp_col):
        subset_cols = [primary_tmp_col, '_dedup_company', '_dedup_role']
        valid_mask = (df_subset[primary_tmp_col] != '')
        df_valid = df_subset[valid_mask].drop_duplicates(subset=subset_cols, keep='first')
        df_missing = df_subset[~valid_mask]
        return pd.concat([df_valid, df_missing], ignore_index=True)
        
    cand_df = dedup_by_subset(cand_df, '_dedup_email')
    cand_df = dedup_by_subset(cand_df, '_dedup_phone')
    
    # Drop temporary columns
    cand_df = cand_df.drop(columns=list(dedup_cols_map.values()))
    
    # Generate stable string IDs based on index so frontend has a solid key
    cand_df['id'] = cand_df.index.astype(str)
    
    # Handle NaN across whole dataframe for JSON serialization later
    cand_df = cand_df.fillna('')
    
    store.state["candidate_dataframe"] = cand_df.copy()
    # =========================================

    response_payload = {
        "kpis": {
            "totalCandidates": int(total_candidates),
            "activePipeline": int(active_pipeline),
            "hold": int(hold),
            "rejected": int(rejected),
            "offered": int(offered_count),
            "joined": int(joined_count),
            "positionsClosed": int(positions_closed),
            "duplicateProfiles": int(duplicate_profiles),
        },
        "funnel": funnel,
        "companyDistribution": company_distribution
    }
    
    store.state["analytics"] = response_payload
    return response_payload