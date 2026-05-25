import pandas as pd
from typing import Dict, Any
import services.store as store
from services.reports.utils import paginate_dataframe, sort_dataframe, create_csv_export, build_report_response

def _get_l2_shortlisted_df(search: str = None) -> pd.DataFrame:
    df = store.state.get("normalized_dataframe")
    if df is None:
        return pd.DataFrame()

    # Find columns matching 'l2'
    target_cols = [c for c in df.columns if 'l2' in c.lower()]
    if not target_cols:
        return pd.DataFrame(columns=['candidateName', 'phoneNumber', 'emailId', 'recruiter', 'companyName', 'role', 'companySpoc'])

    # Filter rows based on regex
    mask = pd.Series([False] * len(df), index=df.index)
    for col in target_cols:
        mask = mask | df[col].astype(str).str.contains('shortlisted|l2 cleared|selected', case=False, na=False)
        
    filtered_df = df[mask].copy()
    if filtered_df.empty:
        return pd.DataFrame(columns=['candidateName', 'phoneNumber', 'emailId', 'recruiter', 'companyName', 'role', 'companySpoc'])

    def safe_get(row, col):
        return str(row[col]).strip() if col in row and pd.notna(row[col]) and str(row[col]).strip() != '' else 'N/A'

    records = []
    for _, row in filtered_df.iterrows():
        records.append({
            "candidateName": safe_get(row, "candidate"),
            "phoneNumber": safe_get(row, "phone number"),
            "emailId": safe_get(row, "email id"),
            "recruiter": safe_get(row, "recruiter"),
            "companyName": safe_get(row, "company_norm") if safe_get(row, "company_norm") != 'N/A' else safe_get(row, "company"),
            "role": safe_get(row, "role_norm") if safe_get(row, "role_norm") != 'N/A' else safe_get(row, "company role"),
            "companySpoc": safe_get(row, "company spoc")
        })

    out_df = pd.DataFrame(records)

    if search and not out_df.empty:
        s = search.lower().strip()
        def match_search(row):
            return any(s in str(val).lower() for val in row.values)
        out_df = out_df[out_df.apply(match_search, axis=1)]

    return out_df

SORT_MAP = {
    "Candidate Name": "candidateName",
    "Phone Number": "phoneNumber",
    "Email ID": "emailId",
    "Recruiter": "recruiter",
    "Company Name": "companyName",
    "Role": "role",
    "Company SPOC": "companySpoc"
}

def get_l2_shortlisted(page: int, page_size: int, search: str = None, sort_by: str = None, sort_desc: bool = False):
    df = _get_l2_shortlisted_df(search)
    has_dataset = store.state.get("normalized_dataframe") is not None
    if df.empty:
        return build_report_response([], {"page": page, "pageSize": page_size, "totalRecords": 0, "totalPages": 1}, meta={"hasDataset": has_dataset})
        
    df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP)
    data, pagination = paginate_dataframe(df, page, page_size)
    
    return build_report_response(data, pagination, meta={"hasDataset": True})

def export_l2_shortlisted(search: str = None, sort_by: str = None, sort_desc: bool = False):
    df = _get_l2_shortlisted_df(search)
    if df.empty:
        df = pd.DataFrame(columns=list(SORT_MAP.values()))
    else:
        df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP)
        
    cols_map = {v: k for k, v in SORT_MAP.items()}
    return create_csv_export(df, cols_map, "hiresight_l2_shortlisted.csv")
