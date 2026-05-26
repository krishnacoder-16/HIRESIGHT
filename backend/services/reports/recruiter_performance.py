import pandas as pd
from typing import Optional
from services.store import state
from services.reports.utils import paginate_dataframe, sort_dataframe, build_report_response

SORT_MAP = {
    "Recruiter Name": "recruiter",
    "Total CVs Sent": "total_cv_sent",
    "Joined Candidates": "joined_candidates"
}

def get_filtered_performance_df(
    timeline_type: Optional[str],
    date: Optional[str],
    month: Optional[str],
    week: Optional[str]
) -> pd.DataFrame:
    df = state.get("normalized_dataframe")
    if df is None or df.empty:
        return pd.DataFrame()

    df = df.copy()
    if 'cv date to client' not in df.columns:
        return pd.DataFrame(columns=df.columns)

    # Coerce to datetime, invalid/null dates become NaT
    df['parsed_date'] = pd.to_datetime(df['cv date to client'], errors='coerce')
    df = df[df['parsed_date'].notna()]

    if timeline_type == 'daily' and date:
        try:
            target_date = pd.to_datetime(date).date()
            df = df[df['parsed_date'].dt.date == target_date]
        except Exception:
            pass
    elif timeline_type == 'monthly' and month:
        try:
            y, m = month.split('-')
            df = df[(df['parsed_date'].dt.year == int(y)) & (df['parsed_date'].dt.month == int(m))]
        except Exception:
            pass
    elif timeline_type == 'weekly' and week:
        try:
            y, w = week.replace('W', '').split('-')
            iso_calendar = df['parsed_date'].dt.isocalendar()
            df = df[(iso_calendar.year == int(y)) & (iso_calendar.week == int(w))]
        except Exception:
            pass

    return df

def process_recruiter_metrics(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame()
        
    df = df[df['recruiter'].notna()]
    df['recruiter'] = df['recruiter'].astype(str).str.split(',')
    df = df.explode('recruiter')
    
    # Trim and filter out empty names
    df['recruiter'] = df['recruiter'].str.strip()
    df = df[df['recruiter'] != '']
    
    if df.empty:
        return pd.DataFrame()

    # Group by recruiter
    grouped = df.groupby('recruiter').agg(
        total_cv_sent=('recruiter', 'size'),
        joined_candidates=('is_joined', lambda x: x.sum())
    ).reset_index()

    # Default sort
    grouped = grouped.sort_values(
        by=['total_cv_sent', 'joined_candidates'], 
        ascending=[False, False]
    )
    
    return grouped

def get_recruiter_performance(
    page: int = 1,
    page_size: int = 25,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_desc: bool = False,
    timeline_type: Optional[str] = None,
    date: Optional[str] = None,
    month: Optional[str] = None,
    week: Optional[str] = None
) -> dict:
    df_raw = state.get("normalized_dataframe")
    if df_raw is None or df_raw.empty:
        return build_report_response([], {"page": 1, "pageSize": page_size, "totalRecords": 0, "totalPages": 0}, meta={"hasDataset": False})

    df = get_filtered_performance_df(timeline_type, date, month, week)
    if df.empty:
        return build_report_response([], {"page": 1, "pageSize": page_size, "totalRecords": 0, "totalPages": 0}, meta={"hasDataset": True})

    grouped = process_recruiter_metrics(df)
    if grouped.empty:
        return build_report_response([], {"page": 1, "pageSize": page_size, "totalRecords": 0, "totalPages": 0}, meta={"hasDataset": True})

    if search:
        s = search.lower()
        grouped = grouped[grouped['recruiter'].str.lower().str.contains(s, na=False)]

    if sort_by:
        numeric_cols = ['total_cv_sent', 'joined_candidates']
        grouped = sort_dataframe(grouped, sort_by, sort_desc, SORT_MAP, numeric_cols)

    results = []
    for _, row in grouped.iterrows():
        results.append({
            "recruiterName": row['recruiter'].title(),
            "totalCvSent": int(row['total_cv_sent']),
            "joinedCandidates": int(row['joined_candidates'])
        })

    results_df = pd.DataFrame(results) if len(results) > 0 else pd.DataFrame()
    page_data, pagination = paginate_dataframe(results_df, page, page_size)
    
    return build_report_response(page_data, pagination, meta={"hasDataset": True})

def export_recruiter_performance_csv(
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_desc: bool = False,
    timeline_type: Optional[str] = None,
    date: Optional[str] = None,
    month: Optional[str] = None,
    week: Optional[str] = None
) -> str:
    df_raw = state.get("normalized_dataframe")
    if df_raw is None or df_raw.empty:
        return ""

    df = get_filtered_performance_df(timeline_type, date, month, week)
    if df.empty:
        return ""

    grouped = process_recruiter_metrics(df)
    if grouped.empty:
        return ""

    if search:
        s = search.lower()
        grouped = grouped[grouped['recruiter'].str.lower().str.contains(s, na=False)]

    if sort_by:
        numeric_cols = ['total_cv_sent', 'joined_candidates']
        grouped = sort_dataframe(grouped, sort_by, sort_desc, SORT_MAP, numeric_cols)

    export_df = pd.DataFrame()
    export_df['Recruiter Name'] = grouped['recruiter'].str.title()
    export_df['Total CVs Sent'] = grouped['total_cv_sent'].astype(int)
    export_df['Joined Candidates'] = grouped['joined_candidates'].astype(int)

    import io
    stream = io.StringIO()
    export_df.to_csv(stream, index=False)
    return stream.getvalue()
