from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from services.analytics import process_excel

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an .xlsx or .xls file.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    # Process via analytics service
    result = process_excel(content)

    # Add metadata
    result["metadata"] = {
        "filename": file.filename,
        "processedRows": result["companyDistribution"]["totalCandidates"],
        "processedTimestamp": datetime.utcnow().isoformat()
    }

    return result
