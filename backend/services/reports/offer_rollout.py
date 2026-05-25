import pandas as pd
from typing import Dict, Any
import services.store as store
from services.reports.utils import paginate_dataframe, sort_dataframe, create_csv_export, build_report_response

def _get_offer_rollout_df(search: str = None) -> pd.DataFrame:
    df = store.state.get("normalized_dataframe")
    if df is None:
        return pd.DataFrame()

    # Candidates marked offered AND not joined
    # is_offered is already calculated in analytics.py (it excludes joined & rejected)
    offered_df = df[df['is_offered']].copy()
    if offered_df.empty:
        return pd.DataFrame()

    records = []
    for _, row in offered_df.iterrows():
        records.append({
            "candidateName": str(row.get('candidate', 'N/A')).title(),
            "company": row.get('company_norm', 'N/A'),
            "role": row.get('role_norm', 'N/A'),
            "companySpoc": str(row.get('company spoc', 'N/A')).title() if pd.notna(row.get('company spoc')) else 'N/A',
            "recruiter": str(row.get('recruiter', 'N/A')).title() if pd.notna(row.get('recruiter')) else 'N/A',
            "offerStatus": str(row.get('offered', 'N/A')).title() if pd.notna(row.get('offered')) else 'N/A',
            "joiningStatus": str(row.get('joining status', 'Pending')).title() if pd.notna(row.get('joining status')) else 'Pending'
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
    "Company": "company",
    "Role": "role",
    "Company SPOC": "companySpoc",
    "Recruiter": "recruiter",
    "Offer Status": "offerStatus",
    "Joining Status": "joiningStatus"
}

def get_offer_rollout(page: int, page_size: int, search: str = None, sort_by: str = None, sort_desc: bool = False):
    df = _get_offer_rollout_df(search)
    if df.empty:
        return build_report_response([], {"page": page, "pageSize": page_size, "totalRecords": 0, "totalPages": 1})
        
    df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP)
    data, pagination = paginate_dataframe(df, page, page_size)
    
    return build_report_response(data, pagination)

def export_offer_rollout(search: str = None, sort_by: str = None, sort_desc: bool = False):
    df = _get_offer_rollout_df(search)
    if df.empty:
        df = pd.DataFrame(columns=list(SORT_MAP.values()))
    else:
        df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP)
        
    cols_map = {v: k for k, v in SORT_MAP.items()}
    return create_csv_export(df, cols_map, "hiresight_offer_rollout.csv")
