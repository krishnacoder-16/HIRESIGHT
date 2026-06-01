import pandas as pd
from typing import Dict, Any
import services.store as store
from services.reports.utils import paginate_dataframe, sort_dataframe, create_csv_export, build_report_response

def _get_closed_positions_df(search: str = None) -> pd.DataFrame:
    df = store.state.get("normalized_dataframe")
    if df is None:
        return pd.DataFrame()

    records = []
    for (comp, role), group in df.groupby(['company_norm', 'role_norm']):
        total_cvs = len(group)
        grp_joined = int(group['is_joined'].sum())
        
        # A position belongs here ONLY IF Joined Candidates > 0
        if grp_joined > 0:
            spoc = "N/A"
            if 'company spoc' in group.columns:
                valid_spocs = group['company spoc'].replace({'nan': '', 'none': '', 'null': ''}).dropna()
                valid_spocs = valid_spocs[valid_spocs.astype(str).str.strip() != '']
                if len(valid_spocs) > 0:
                    spoc = str(valid_spocs.iloc[0]).title()

            recruiters_list = []
            if 'recruiter' in group.columns:
                valid_recs = group['recruiter'].replace({'nan': '', 'none': '', 'null': ''}).dropna()
                valid_recs = valid_recs[valid_recs.astype(str).str.strip() != '']
                raw_rec_list = valid_recs.unique().tolist()
                recruiters_list = sorted([str(r).title().strip() for r in raw_rec_list if str(r).strip()])

            closure_date = "N/A"
            if 'joining date' in group.columns:
                joined_rows = group[group['is_joined']]
                valid_dates = joined_rows['joining date'].dropna()
                if len(valid_dates) > 0:
                    # attempt to get max date or just string
                    try:
                        dates = pd.to_datetime(valid_dates, errors='coerce').dropna()
                        if len(dates) > 0:
                            closure_date = dates.max().strftime('%Y-%m-%d')
                        else:
                            closure_date = str(valid_dates.iloc[0])
                    except:
                        closure_date = str(valid_dates.iloc[0])
                        
            records.append({
                "company": comp,
                "role": role,
                "companySpoc": spoc,
                "recruiters": recruiters_list,
                "totalCvs": total_cvs,
                "joinedCandidates": grp_joined,
                "closureDate": closure_date
            })
            
    out_df = pd.DataFrame(records)
    
    if search and not out_df.empty:
        s = search.lower().strip()
        def match_search(row):
            comp = str(row.get('company', '')).lower()
            role = str(row.get('role', '')).lower()
            spoc = str(row.get('companySpoc', '')).lower()
            recs = " ".join([str(r).lower() for r in row.get('recruiters', [])])
            return s in comp or s in role or s in spoc or s in recs
        out_df = out_df[out_df.apply(match_search, axis=1)]
        
    return out_df

SORT_MAP = {
    "Company": "company",
    "Role": "role",
    "Company SPOC": "companySpoc",
    "Total CVs": "totalCvs",
    "Joined Candidates": "joinedCandidates",
    "Closure Date": "closureDate"
}

def get_closed_positions(page: int, page_size: int, search: str = None, sort_by: str = None, sort_desc: bool = False):
    df = _get_closed_positions_df(search)
    has_dataset = store.state.get("normalized_dataframe") is not None
    if df.empty:
        return build_report_response([], {"page": page, "pageSize": page_size, "totalRecords": 0, "totalPages": 1}, meta={"hasDataset": has_dataset})
        
    df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP, numeric_cols=['totalCvs', 'joinedCandidates'])
    data, pagination = paginate_dataframe(df, page, page_size)
    
    return build_report_response(data, pagination, meta={"hasDataset": True})

def export_closed_positions(search: str = None, sort_by: str = None, sort_desc: bool = False):
    df = _get_closed_positions_df(search)
    if df.empty:
        df = pd.DataFrame(columns=["company", "role", "companySpoc", "recruiters", "totalCvs", "joinedCandidates", "closureDate"])
    else:
        df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP, numeric_cols=['totalCvs', 'joinedCandidates'])
        
    cols_map = {
        "company": "Company",
        "role": "Role",
        "companySpoc": "Company SPOC",
        "recruiters": "Recruiters",
        "totalCvs": "Total CVs",
        "joinedCandidates": "Joined Candidates",
        "closureDate": "Closure Date"
    }
    return create_csv_export(df, cols_map, "hiresight_closed_positions.csv")
