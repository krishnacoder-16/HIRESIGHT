from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, candidates

app = FastAPI(title="HIRESIGHT API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(candidates.router, prefix="/api/candidates")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "HIRESIGHT Backend"}
