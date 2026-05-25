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

@router.get("/debug-open-roles")
def debug_open_roles():
    from services.store import state
    df = state.get("normalized_dataframe")
    if df is None: return {"roles": []}
    
    open_roles_list = []
    for (comp, role), group in df.groupby(['company_norm', 'role_norm']):
        grp_active = int(group['is_active'].sum())
        is_open = False
        if grp_active > 0:
            is_open = True
        else:
            is_closed = False
            closed_keywords = ['closed', 'cancelled', 'drive cancelled', 'position closed']
            for _, row in group.iterrows():
                for val in row.values:
                    s_val = str(val).lower()
                    if any(k == s_val or k in s_val for k in closed_keywords):
                        is_closed = True
                        break
                if is_closed:
                    break
            if not is_closed:
                is_open = True
                
        if is_open:
            open_roles_list.append(f"{comp} - {role}")
            
    return {"roles": open_roles_list}
