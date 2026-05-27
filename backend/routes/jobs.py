from fastapi import APIRouter, Query
from services.jobs import get_paginated_jobs, export_jobs_csv

router = APIRouter()

@router.get("")
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    company: str = Query(None),
    recruiter: str = Query(None),
    status: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return get_paginated_jobs(
        page=page,
        page_size=page_size,
        search=search,
        company=company,
        recruiter=recruiter,
        status=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/export")
async def export_jobs(
    search: str = Query(None),
    company: str = Query(None),
    recruiter: str = Query(None),
    status: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return export_jobs_csv(
        search=search,
        company=company,
        recruiter=recruiter,
        status=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
