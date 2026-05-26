from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import pandas as pd

from services.timeline.joined_timeline import get_joined_timeline_data, export_joined_timeline_csv
from services.timeline.offered_timeline import get_offered_timeline_data, export_offered_timeline_csv

router = APIRouter()

@router.get("/joined")
def get_joined_timeline(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_desc: bool = False,
    timeline_type: Optional[str] = None,
    month: Optional[str] = None,
    week: Optional[str] = None
):
    return get_joined_timeline_data(
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_desc=sort_desc,
        timeline_type=timeline_type,
        month=month,
        week=week
    )

@router.get("/joined/export")
def export_joined_timeline(
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_desc: bool = False,
    timeline_type: Optional[str] = None,
    month: Optional[str] = None,
    week: Optional[str] = None
):
    csv_str = export_joined_timeline_csv(
        search=search,
        sort_by=sort_by,
        sort_desc=sort_desc,
        timeline_type=timeline_type,
        month=month,
        week=week
    )
    
    response = StreamingResponse(
        iter([csv_str]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=joined_candidates_timeline.csv"
    return response

@router.get("/offered")
def get_offered_timeline(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_desc: bool = False,
    timeline_type: Optional[str] = None,
    month: Optional[str] = None,
    week: Optional[str] = None
):
    return get_offered_timeline_data(
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_desc=sort_desc,
        timeline_type=timeline_type,
        month=month,
        week=week
    )

@router.get("/offered/export")
def export_offered_timeline(
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_desc: bool = False,
    timeline_type: Optional[str] = None,
    month: Optional[str] = None,
    week: Optional[str] = None
):
    csv_str = export_offered_timeline_csv(
        search=search,
        sort_by=sort_by,
        sort_desc=sort_desc,
        timeline_type=timeline_type,
        month=month,
        week=week
    )
    
    response = StreamingResponse(
        iter([csv_str]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=offered_candidates_timeline.csv"
    return response
