import pandas as pd
import io
import math
from typing import Dict, Any, List
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import services.store as store

def get_filtered_jobs_df(search: str = None, company: str = None, recruiter: str = None, status: str = None) -> pd.DataFrame:
    df = store.state.get("jobs_dataframe")
    if df is None:
        return None

    if search:
        s = search.lower().strip()
        def match_search(row):
            comp = str(row.get('company', '')).lower()
            role = str(row.get('role', '')).lower()
            spoc = str(row.get('companySpoc', '')).lower()
            recs = " ".join([str(r).lower() for r in row.get('recruiters', [])])
            return s in comp or s in role or s in spoc or s in recs
        df = df[df.apply(match_search, axis=1)]

    if company:
        df = df[df['company'].astype(str).str.lower() == company.lower().strip()]

    if recruiter:
        def match_recruiter(row):
            recs = [str(r).lower().strip() for r in row.get('recruiters', [])]
            return recruiter.lower().strip() in recs
        df = df[df.apply(match_recruiter, axis=1)]

    if status and status.lower() == 'open':
        if 'isOpen' in df.columns:
            df = df[df['isOpen'] == True]

    return df

def get_paginated_jobs(page: int, page_size: int, search: str = None, company: str = None, recruiter: str = None, status: str = None, sort_by: str = None, sort_desc: bool = False) -> Dict[str, Any]:
    df = get_filtered_jobs_df(search, company, recruiter, status)
    if df is None:
        raise HTTPException(status_code=404, detail="No dataset uploaded yet.")

    full_df = store.state.get("jobs_dataframe")
    companies = sorted([str(c) for c in full_df['company'].unique() if str(c).strip() and str(c) != 'nan'])
    
    all_recruiters = set()
    for rec_list in full_df['recruiters']:
        for rec in rec_list:
            if rec:
                all_recruiters.add(rec)
    recruiters = sorted(list(all_recruiters))

    if sort_by:
        sort_col_map = {
            "Company": "company",
            "Role": "role",
            "Total CVs": "totalCvs",
            "Active Candidates": "activeCandidates",
            "Joined": "joined"
        }
        actual_col = sort_col_map.get(sort_by)
        if actual_col and actual_col in df.columns:
            if actual_col in ['totalCvs', 'activeCandidates', 'joined']:
                df = df.sort_values(by=actual_col, ascending=not sort_desc, kind='mergesort')
            else:
                df = df.sort_values(
                    by=actual_col, 
                    ascending=not sort_desc, 
                    key=lambda col: col.astype(str).str.lower(),
                    kind='mergesort'
                )

    total_records = len(df)
    total_pages = math.ceil(total_records / page_size) if total_records > 0 else 1

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_df = df.iloc[start_idx:end_idx]

    data = page_df.to_dict('records')

    return {
        "data": data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "totalRecords": total_records,
            "totalPages": total_pages
        },
        "filters": {
            "companies": companies,
            "recruiters": recruiters
        }
    }

def export_jobs_csv(search: str = None, company: str = None, recruiter: str = None, status: str = None, sort_by: str = None, sort_desc: bool = False):
    df = get_filtered_jobs_df(search, company, recruiter, status)
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No data available to export.")

    if sort_by:
        sort_col_map = {
            "Company": "company",
            "Role": "role",
            "Total CVs": "totalCvs",
            "Active Candidates": "activeCandidates",
            "Joined": "joined"
        }
        actual_col = sort_col_map.get(sort_by)
        if actual_col and actual_col in df.columns:
            if actual_col in ['totalCvs', 'activeCandidates', 'joined']:
                df = df.sort_values(by=actual_col, ascending=not sort_desc, kind='mergesort')
            else:
                df = df.sort_values(
                    by=actual_col, 
                    ascending=not sort_desc, 
                    key=lambda col: col.astype(str).str.lower(),
                    kind='mergesort'
                )
    
    export_df = df.copy()
    export_df['recruiters'] = export_df['recruiters'].apply(lambda x: ", ".join(x) if isinstance(x, list) else x)

    columns_mapping = {
        "company": "Company",
        "role": "Role",
        "companySpoc": "Company SPOC",
        "recruiters": "Recruiters",
        "recruitersCount": "Recruiters Count",
        "totalCvs": "Total CVs",
        "activeCandidates": "Active Candidates",
        "rejected": "Rejected",
        "joined": "Joined"
    }
    
    export_df = export_df[[col for col in columns_mapping.keys() if col in export_df.columns]]
    export_df = export_df.rename(columns=columns_mapping)

    stream = io.StringIO()
    export_df.to_csv(stream, index=False)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=hiresight_jobs_pipeline.csv"
    
    return response
