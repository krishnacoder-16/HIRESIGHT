from fastapi import APIRouter, Query
from services.reports.closed_positions import get_closed_positions, export_closed_positions
from services.reports.joined_candidates import get_joined_candidates, export_joined_candidates
from services.reports.rejection_analysis import get_rejection_analysis, export_rejection_analysis
from services.reports.offer_rollout import get_offer_rollout, export_offer_rollout
from services.reports.l1_shortlisted import get_l1_shortlisted, export_l1_shortlisted
from services.reports.l2_shortlisted import get_l2_shortlisted, export_l2_shortlisted

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

# --- Joined Candidates ---
@router.get("/joined-candidates")
async def api_joined_candidates(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return get_joined_candidates(page, page_size, search, sort_by, sort_desc)

@router.get("/joined-candidates/export")
async def api_export_joined_candidates(
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return export_joined_candidates(search, sort_by, sort_desc)

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

# --- Offer Rollout ---
@router.get("/offer-rollout")
async def api_offer_rollout(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return get_offer_rollout(page, page_size, search, sort_by, sort_desc)

@router.get("/offer-rollout/export")
async def api_export_offer_rollout(
    search: str = Query(None),
    sort_by: str = Query(None),
    sort_desc: bool = Query(False)
):
    return export_offer_rollout(search, sort_by, sort_desc)

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
