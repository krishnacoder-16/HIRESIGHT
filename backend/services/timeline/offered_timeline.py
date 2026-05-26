import pandas as pd
from typing import Optional
from services.store import state
from services.reports.utils import paginate_dataframe, sort_dataframe, build_report_response

SORT_MAP = {
    "Candidate Name": "candidate",
    "Company": "company_norm",
    "Role": "role_norm",
    "Company SPOC": "company spoc",
    "Recruiter": "recruiter",
    "Date": "cv date to client"
}

def get_filtered_timeline_df(timeline_type: Optional[str], month: Optional[str], week: Optional[str], date_col: str) -> pd.DataFrame:
    df = state.get("normalized_dataframe")
    if df is None or df.empty:
        return pd.DataFrame()

    df = df.copy()
    if date_col not in df.columns:
        return pd.DataFrame(columns=df.columns)

    # Coerce to datetime, invalid/null dates become NaT
    df['parsed_date'] = pd.to_datetime(df[date_col], errors='coerce')
    df = df[df['parsed_date'].notna()]

    if timeline_type == 'monthly' and month:
        try:
            y, m = month.split('-')
            df = df[(df['parsed_date'].dt.year == int(y)) & (df['parsed_date'].dt.month == int(m))]
        except Exception:
            pass

    if timeline_type == 'weekly' and week:
        try:
            y, w = week.replace('W', '').split('-')
            iso_calendar = df['parsed_date'].dt.isocalendar()
            df = df[(iso_calendar.year == int(y)) & (iso_calendar.week == int(w))]
        except Exception:
            pass

    # Format explicitly as YYYY-MM-DD
    df[date_col] = df['parsed_date'].dt.strftime('%Y-%m-%d')
    return df

def get_offered_timeline_data(
    page: int = 1,
    page_size: int = 25,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_desc: bool = False,
    timeline_type: Optional[str] = None,
    month: Optional[str] = None,
    week: Optional[str] = None
) -> dict:
    df_raw = state.get("normalized_dataframe")
    if df_raw is None or df_raw.empty:
        return build_report_response([], {"page": 1, "pageSize": page_size, "totalRecords": 0, "totalPages": 0}, meta={"hasDataset": False})

    df = get_filtered_timeline_df(timeline_type, month, week, "cv date to client")
    if df.empty:
        return build_report_response([], {"page": 1, "pageSize": page_size, "totalRecords": 0, "totalPages": 0}, meta={"hasDataset": True})

    # Only include offered candidates
    df = df[df['is_offered'] == True]

    if search:
        s = search.lower()
        search_cols = ['candidate', 'company_norm', 'role_norm', 'recruiter', 'company spoc']
        mask = pd.Series([False] * len(df), index=df.index)
        for col in search_cols:
            if col in df.columns:
                mask = mask | df[col].astype(str).str.lower().str.contains(s, na=False)
        df = df[mask]

    df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP)

    results = []
    for _, row in df.iterrows():
        recruiters = []
        if pd.notna(row.get('recruiter')):
            recruiters = [r.strip() for r in str(row['recruiter']).split(',') if r.strip()]

        results.append({
            "candidateName": str(row.get('candidate', 'N/A')).title(),
            "companyName": str(row.get('company_norm', 'N/A')).title(),
            "role": str(row.get('role_norm', 'N/A')).title(),
            "companySpoc": str(row.get('company spoc', 'N/A')).title() if pd.notna(row.get('company spoc')) else 'N/A',
            "recruiter": recruiters,
            "offerStatus": "Offered",
            "date": str(row.get('cv date to client', 'N/A')),
        })

    results_df = pd.DataFrame(results) if len(results) > 0 else pd.DataFrame()
    page_data, pagination = paginate_dataframe(results_df, page, page_size)
    
    return build_report_response(page_data, pagination, meta={"hasDataset": True})

def export_offered_timeline_csv(
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_desc: bool = False,
    timeline_type: Optional[str] = None,
    month: Optional[str] = None,
    week: Optional[str] = None
) -> str:
    df_raw = state.get("normalized_dataframe")
    if df_raw is None or df_raw.empty:
        return ""

    df = get_filtered_timeline_df(timeline_type, month, week, "cv date to client")
    if df.empty:
        return ""

    df = df[df['is_offered'] == True]

    if search:
        s = search.lower()
        search_cols = ['candidate', 'company_norm', 'role_norm', 'recruiter', 'company spoc']
        mask = pd.Series([False] * len(df), index=df.index)
        for col in search_cols:
            if col in df.columns:
                mask = mask | df[col].astype(str).str.lower().str.contains(s, na=False)
        df = df[mask]

    df = sort_dataframe(df, sort_by, sort_desc, SORT_MAP)

    export_df = pd.DataFrame()
    export_df['Candidate Name'] = df['candidate'].fillna('N/A').str.title()
    export_df['Company'] = df['company_norm'].fillna('N/A').str.title()
    export_df['Role'] = df['role_norm'].fillna('N/A').str.title()
    export_df['Company SPOC'] = df['company spoc'].fillna('N/A').str.title()
    export_df['Recruiter'] = df['recruiter'].fillna('N/A')
    export_df['Offer Status'] = "Offered"
    export_df['Date'] = df['cv date to client'].fillna('N/A')

    import io
    stream = io.StringIO()
    export_df.to_csv(stream, index=False)
    return stream.getvalue()
