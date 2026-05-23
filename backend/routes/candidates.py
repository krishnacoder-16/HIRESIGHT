from fastapi import APIRouter, Query
from services.candidates import get_paginated_candidates, export_candidates_csv

router = APIRouter()

@router.get("/")
async def list_candidates(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = None,
    recruiter: str = None,
    company: str = None,
    sort_by: str = None,
    sort_desc: bool = False
):
    return get_paginated_candidates(
        page=page,
        page_size=page_size,
        search=search,
        recruiter=recruiter,
        company=company,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/export")
async def export_candidates(
    search: str = None,
    recruiter: str = None,
    company: str = None,
    sort_by: str = None,
    sort_desc: bool = False
):
    return export_candidates_csv(
        search=search,
        recruiter=recruiter,
        company=company,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
