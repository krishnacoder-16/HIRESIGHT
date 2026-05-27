from fastapi import APIRouter, HTTPException
import services.store as store

router = APIRouter()

@router.get("")
async def get_analytics():
    analytics_data = store.state.get("analytics")
    if analytics_data is None:
        raise HTTPException(status_code=404, detail="No analytics data found. Please upload a dataset.")
    return analytics_data
