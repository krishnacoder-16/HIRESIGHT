from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, analytics, candidates, jobs, reports, timeline

app = FastAPI(title="HIRESIGHT API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://YOUR_VERCEL_APP.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["candidates"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["timeline"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "HIRESIGHT Backend"}
