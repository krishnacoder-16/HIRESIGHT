from fastapi import APIRouter

router = APIRouter()

@router.post("/upload")
async def upload_file():
    # Placeholder for Excel upload
    return {"status": "success", "message": "Dummy upload endpoint. Excel parsing not yet implemented."}
