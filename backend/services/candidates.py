import pandas as pd
import io
import math
from typing import Dict, Any, List
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import services.store as store

def get_filtered_candidates_df(search: str = None, recruiter: str = None, company: str = None, sort_by: str = None, sort_desc: bool = False) -> pd.DataFrame:
    df = store.state.get("candidate_dataframe")
    if df is None:
        raise HTTPException(status_code=404, detail="No dataset uploaded yet.")
    
    # Work on a copy
    filtered_df = df.copy()

    # Filters
    if recruiter and 'recruiter' in filtered_df.columns:
        filtered_df = filtered_df[filtered_df['recruiter'].astype(str).str.lower() == recruiter.lower()]
        
    if company and 'company' in filtered_df.columns:
        filtered_df = filtered_df[filtered_df['company'].astype(str).str.lower() == company.lower()]

    # Global Search
    if search:
        search = search.lower().strip()
        search_cols = ['candidate', 'phone number', 'email id', 'recruiter', 'company', 'company spoc']
        
        mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
        for col in search_cols:
            if col in filtered_df.columns:
                mask = mask | filtered_df[col].astype(str).str.lower().str.contains(search, na=False)
        filtered_df = filtered_df[mask]

    # Sorting
    if sort_by:
        # map frontend sort keys to dataframe columns if needed
        sort_col_map = {
            "Candidate Name": "candidate",
            "Recruiter": "recruiter",
            "Company": "company"
        }
        target_col = sort_col_map.get(sort_by, sort_by.lower())
        if target_col in filtered_df.columns:
            filtered_df = filtered_df.sort_values(by=target_col, ascending=not sort_desc, na_position='last')

    return filtered_df

def get_paginated_candidates(page: int = 1, page_size: int = 25, search: str = None, recruiter: str = None, company: str = None, sort_by: str = None, sort_desc: bool = False) -> Dict[str, Any]:
    df = get_filtered_candidates_df(search, recruiter, company, sort_by, sort_desc)
    
    total_records = len(df)
    total_pages = math.ceil(total_records / page_size) if total_records > 0 else 0
    
    # Ensure page is within bounds
    page = max(1, page)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    
    paginated_df = df.iloc[start_idx:end_idx]
    
    # Extract dynamic filter options
    base_df = store.state.get("candidate_dataframe")
    recruiters = []
    companies = []
    
    if base_df is not None:
        if 'recruiter' in base_df.columns:
            recruiters = sorted([str(r) for r in base_df['recruiter'].dropna().unique() if str(r).strip() != ''])
        if 'company' in base_df.columns:
            companies = sorted([str(c) for c in base_df['company'].dropna().unique() if str(c).strip() != ''])

    # Format the data for the frontend
    # Required columns: Candidate Name, Phone Number, Email ID, Recruiter Name, Company Name, Company SPOC
    def safe_get(row, col):
        return str(row[col]) if col in row and pd.notna(row[col]) and str(row[col]) != '' else 'N/A'

    data = []
    for _, row in paginated_df.iterrows():
        data.append({
            "id": row.get("id", str(_)),
            "candidateName": safe_get(row, "candidate"),
            "phoneNumber": safe_get(row, "phone number"),
            "emailId": safe_get(row, "email id"),
            "recruiterName": safe_get(row, "recruiter"),
            "companyName": safe_get(row, "company"),
            "companySpoc": safe_get(row, "company spoc")
        })

    return {
        "data": data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "totalPages": total_pages,
            "totalRecords": total_records
        },
        "filters": {
            "recruiters": recruiters,
            "companies": companies
        }
    }

def export_candidates_csv(search: str = None, recruiter: str = None, company: str = None, sort_by: str = None, sort_desc: bool = False):
    df = get_filtered_candidates_df(search, recruiter, company, sort_by, sort_desc)
    
    # We only want specific columns exported
    export_cols = []
    col_map = {
        "candidate": "Candidate Name",
        "phone number": "Phone Number",
        "email id": "Email ID",
        "recruiter": "Recruiter Name",
        "company": "Company Name",
        "company spoc": "Company SPOC"
    }
    
    export_df = pd.DataFrame()
    for col, nice_name in col_map.items():
        if col in df.columns:
            export_df[nice_name] = df[col]
        else:
            export_df[nice_name] = 'N/A'
            
    stream = io.StringIO()
    export_df.to_csv(stream, index=False)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=candidates_export.csv"
    return response
