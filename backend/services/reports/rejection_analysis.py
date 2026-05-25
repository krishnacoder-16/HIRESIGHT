import pandas as pd
from typing import Dict, Any
import services.store as store
from services.reports.utils import paginate_dataframe, sort_dataframe, create_csv_export, build_report_response

def _get_rejection_analysis_df(search: str = None) -> pd.DataFrame:
    df = store.state.get("normalized_dataframe")
    if df is None:
        return pd.DataFrame()

    def has_keyword(row, keywords):
        for val in row.values:
            s_val = str(val).lower()
            if any(k in s_val for k in keywords):
                return True
        return False

    records = []
    for (comp, role), group in df.groupby(['company_norm', 'role_norm']):
        rejected_df = group[group['is_rejected']]
        if rejected_df.empty:
            continue
            
        dropped = 0
        no_response = 0
        not_interested = 0
        rejected = 0
        
        for _, row in rejected_df.iterrows():
            if has_keyword(row, ['dropped']):
                dropped += 1
            elif has_keyword(row, ['no response']):
                no_response += 1
            elif has_keyword(row, ['not interested']):
                not_interested += 1
            else:
                rejected += 1
                
        total_failed = len(rejected_df)
        rejection_percentage = round((total_failed / len(group)) * 100, 2) if len(group) > 0 else 0
        
        recruiters_list = []
        if 'recruiter' in group.columns:
            valid_recs = group['recruiter'].replace({'nan': '', 'none': '', 'null': ''}).dropna()
            valid_recs = valid_recs[valid_recs.astype(str).str.strip() != '']
            raw_rec_list = valid_recs.unique().tolist()
            recruiters_list = sorted([str(r).title().strip() for r in raw_rec_list if str(r).strip()])

        records.append({
            "company": comp,
            "role": role,
            "recruiter": recruiters_list,
            "rejected": rejected,
            "dropped": dropped,
            "noResponse": no_response,
            "notInterested": not_interested,
            "totalFailed": total_failed,
            "totalCandidates": len(group),
            "rejectionPercentage": rejection_percentage
        })
        
    out_df = pd.DataFrame(records)
    
    if search and not out_df.empty:
        s = search.lower().strip()
        def match_search(row):
            comp = str(row.get('company', '')).lower()
            role = str(row.get('role', '')).lower()
            recs = " ".join([str(r).lower() for r in row.get('recruiter', [])])
            return s in comp or s in role or s in recs
        out_df = out_df[out_df.apply(match_search, axis=1)]
        
    return out_df

SORT_MAP = {
    "Company": "company",
    "Role": "role",
    "Recruiter": "recruiter",
    "Rejected": "rejected",
    "Dropped": "dropped",
    "No Response": "noResponse",
    "Not Interested": "notInterested",
    "Total Failed": "totalFailed",
    "Total Candidates": "totalCandidates",
    "Rejection %": "rejectionPercentage"
}

def get_rejection_analysis(page: int, page_size: int, search: str = None, sort_by: str = None, sort_desc: bool = False):
    df = _get_rejection_analysis_df(search)
    has_dataset = store.state.get("normalized_dataframe") is not None
    if df.empty:
        return build_report_response([], {"page": page, "pageSize": page_size, "totalRecords": 0, "totalPages": 1}, meta={"hasDataset": has_dataset})
        
    numeric_cols = ["rejected", "dropped", "noResponse", "notInterested", "totalFailed", "totalCandidates", "rejectionPercentage"]
    df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP, numeric_cols=numeric_cols)
    data, pagination = paginate_dataframe(df, page, page_size)
    
    return build_report_response(data, pagination, meta={"hasDataset": True})

def export_rejection_analysis(search: str = None, sort_by: str = None, sort_desc: bool = False):
    df = _get_rejection_analysis_df(search)
    if df.empty:
        df = pd.DataFrame(columns=list(SORT_MAP.values()))
    else:
        numeric_cols = ["rejected", "dropped", "noResponse", "notInterested", "totalFailed", "totalCandidates", "rejectionPercentage"]
        df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP, numeric_cols=numeric_cols)
        
    cols_map = {v: k for k, v in SORT_MAP.items()}
    return create_csv_export(df, cols_map, "hiresight_rejection_analysis.csv")
