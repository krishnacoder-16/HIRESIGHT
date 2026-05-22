# HIRESIGHT

**HIRESIGHT** is a premium, enterprise-grade HR Recruitment Analytics Dashboard. It provides real-time pipeline intelligence by automatically processing raw recruiter sourcing trackers and transforming messy Excel data into clean, actionable insights.

![HIRESIGHT Dashboard Concept](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)

## 🚀 Features

- **Dynamic Analytics Dashboard:** A sleek, premium Next.js 15 interface designed to feel like top-tier enterprise operations software.
- **Live Excel Processing:** Upload candidate trackers directly from the dashboard and watch the UI immediately repaint with live metrics—no page refresh required.
- **Priority-Based State Resolver:** Uses a smart Pandas-powered backend to resolve a candidate's true final state by evaluating outcome columns (e.g., Joined, Rejected) strictly before pipeline stages (e.g., L1 Interview), ensuring absolute KPI accuracy.
- **Zero-Trust Normalization:** Automatically handles dirty recruiter data (e.g., `"  EMAIL ID "`, `"candidate_drop"`, `"not interested"`) by stripping whitespace, standardizing columns, and mapping countless edge-cases to a clean internal schema.
- **Key Metrics Tracked:**
  - Active Pipeline, Holds, and Rejections
  - Candidates Offered vs. Joined
  - Duplicate Profile Detection
  - Positions Closed
  - Interview Conversion Funnel (Submitted → L1 → L2 → L3 → Offered → Joined)
  - Company Hiring Distribution

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Typography:** Inter Font Family

### Backend (API & Analytics Engine)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Language:** Python 3.11+
- **Data Engine:** [Pandas](https://pandas.pydata.org/)
- **Excel Parsing:** Openpyxl
- **Server:** Uvicorn

## 📂 Project Structure

```text
c:\Hiresight\
├── frontend/                 # Next.js 15 Frontend
│   ├── src/app/              # App Router pages and layouts
│   ├── src/components/       # Reusable UI components (Navbar, Sidebar, KpiCards)
│   ├── src/contexts/         # Global state (DashboardContext, ToastContext)
│   └── src/types/            # TypeScript interfaces
│
└── backend/                  # FastAPI Backend
    ├── main.py               # Application entry point
    ├── routes/               # API endpoints (e.g., /upload)
    ├── services/             # Core business logic (Pandas processing)
    └── utils/                # Normalization helpers and configuration rules
```

## ⚙️ Getting Started

### 1. Start the Backend API
Navigate to the backend directory, activate your virtual environment, and start the FastAPI server:

```bash
cd backend
# Activate virtual environment (Windows)
.\venv\Scripts\activate 
# Install dependencies if you haven't already
pip install -r requirements.txt
# Start the Uvicorn server
python -m uvicorn main:app --reload --port 8000
```
*The API will be available at `http://localhost:8000/api`*

### 2. Start the Frontend Application
In a new terminal window, navigate to the frontend directory:

```bash
cd frontend
# Install dependencies
npm install
# Start the Next.js development server
npm run dev
```
*The dashboard will be available at `http://localhost:3000`*

## 🧠 Core Business Logic (Backend)

HIRESIGHT is built with strict rules regarding candidate data to ensure reporting precision. 

The `services/analytics.py` engine maps out candidate rows using a rigid **Status Priority Resolver**:
1. `Joined` (Highest Priority)
2. `Offered` / `Selected`
3. `Rejected` / `Candidate Drop` / `Not Interested` / `Position Closed`
4. `Hold`
5. `Active Pipeline Stages` (Shortlisted, Pending, etc.) (Lowest Priority)

This guarantees that if a recruiter accidentally leaves a candidate as "Shortlisted" in round 1, but "Rejected" in Final Feedback, the system will accurately bucket them into Rejections.

## 🤝 Contributing
Maintain the clean separation of concerns. Do not introduce heavy abstractions (e.g., Redux, unnecessary charting libraries) without explicit architectural approval. Keep the UI premium and the API responses strictly typed.
