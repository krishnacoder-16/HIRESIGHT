import math
import io
from fastapi.responses import StreamingResponse
import pandas as pd
from typing import Dict, Any, List

def paginate_dataframe(df: pd.DataFrame, page: int, page_size: int) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
    total_records = len(df)
    total_pages = math.ceil(total_records / page_size) if total_records > 0 else 1
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_df = df.iloc[start_idx:end_idx]
    
    return page_df.to_dict('records'), {
        "page": page,
        "pageSize": page_size,
        "totalRecords": total_records,
        "totalPages": total_pages
    }

def sort_dataframe(df: pd.DataFrame, sort_by: str, sort_desc: bool, sort_col_map: dict, numeric_cols: list = None) -> pd.DataFrame:
    if not sort_by:
        return df
        
    actual_col = sort_col_map.get(sort_by)
    if actual_col and actual_col in df.columns:
        numeric = numeric_cols and actual_col in numeric_cols
        if numeric:
            df = df.sort_values(by=actual_col, ascending=not sort_desc, kind='mergesort')
        else:
            df = df.sort_values(
                by=actual_col, 
                ascending=not sort_desc, 
                key=lambda col: col.astype(str).str.lower(),
                kind='mergesort'
            )
    return df

def create_csv_export(df: pd.DataFrame, columns_mapping: dict, filename: str) -> StreamingResponse:
    export_df = df.copy()
    
    # Flatten list columns like recruiters
    for col in export_df.columns:
        export_df[col] = export_df[col].apply(lambda x: ", ".join(x) if isinstance(x, list) else x)
        
    export_df = export_df[[col for col in columns_mapping.keys() if col in export_df.columns]]
    export_df = export_df.rename(columns=columns_mapping)
    
    stream = io.StringIO()
    export_df.to_csv(stream, index=False)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    
    return response

def build_report_response(data: list, pagination: dict, filters: dict = None, meta: dict = None) -> dict:
    res = {
        "data": data,
        "pagination": pagination,
        "filters": filters or {},
        "meta": meta or {}
    }
    return res
