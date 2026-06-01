from fastapi import APIRouter, Query
from services.reports.closed_positions import get_closed_positions, export_closed_positions
from services.reports.internal_closures import get_internal_closures, export_internal_closures
from services.reports.summary import get_reports_summary
from services.reports.rejection_analysis import get_rejection_analysis, export_rejection_analysis
from services.reports.l1_shortlisted import get_l1_shortlisted, export_l1_shortlisted
from services.reports.l2_shortlisted import get_l2_shortlisted, export_l2_shortlisted
from services.reports.recruiter_performance import get_recruiter_performance, export_recruiter_performance_csv

router = APIRouter()

# --- Closed Positions ---
@router.get("/closed-positions")
async def api_closed_positions(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return get_closed_positions(page, page_size, search, sort_by, sort_desc)

@router.get("/closed-positions/export")
async def api_export_closed_positions(
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return export_closed_positions(search, sort_by, sort_desc)


# --- Closed by Client / Internal Closures ---
@router.get("/internal-closures")
async def api_internal_closures(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return get_internal_closures(page, page_size, search, sort_by, sort_desc)

@router.get("/internal-closures/export")
async def api_export_internal_closures(
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return export_internal_closures(search, sort_by, sort_desc)


# --- Reports Summary Counts ---
@router.get("/summary")
async def api_reports_summary():
    return get_reports_summary()


# --- Rejection Analysis ---
@router.get("/rejection-analysis")
async def api_rejection_analysis(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return get_rejection_analysis(page, page_size, search, sort_by, sort_desc)

@router.get("/rejection-analysis/export")
async def api_export_rejection_analysis(
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return export_rejection_analysis(search, sort_by, sort_desc)


# --- L1 Shortlisted ---
@router.get("/l1-shortlisted")
async def api_l1_shortlisted(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return get_l1_shortlisted(page, page_size, search, sort_by, sort_desc)

@router.get("/l1-shortlisted/export")
async def api_export_l1_shortlisted(
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return export_l1_shortlisted(search, sort_by, sort_desc)

# --- L2 Shortlisted ---
@router.get("/l2-shortlisted")
async def api_l2_shortlisted(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return get_l2_shortlisted(page, page_size, search, sort_by, sort_desc)

@router.get("/l2-shortlisted/export")
async def api_export_l2_shortlisted(
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return export_l2_shortlisted(search, sort_by, sort_desc)

# --- Recruiter Performance ---
@router.get("/recruiter-performance")
async def api_recruiter_performance(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False),
    timeline_type: str = Query(None),
    date: str = Query(None),
    month: str = Query(None),
    week: str = Query(None)
):
    return get_recruiter_performance(page, page_size, search, sort_by, sort_desc, timeline_type, date, month, week)

@router.get("/recruiter-performance/export")
async def api_export_recruiter_performance(
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False),
    timeline_type: str = Query(None),
    date: str = Query(None),
    month: str = Query(None),
    week: str = Query(None)
):
    from fastapi.responses import StreamingResponse
    csv_str = export_recruiter_performance_csv(search, sort_by, sort_desc, timeline_type, date, month, week)
    response = StreamingResponse(iter([csv_str]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=recruiter_performance.csv"
    return response
