# 🚀 HIRESIGHT — Recruitment Analytics & ATS Dashboard

## 📌 Overview

HIRESIGHT is a modern recruitment analytics and ATS-style dashboard built for internal hiring operations.

The platform transforms recruiter sourcing tracker Excel sheets into a fully interactive analytics system with:

* KPI dashboards
* Candidate pipeline management
* Job tracking
* Reports & recruiter analytics
* Hiring timeline tracking
* Dynamic Excel-based data ingestion

The entire system works from a single uploaded Excel sheet without requiring a database.

---

# ✨ Core Features

## 📊 Dashboard Analytics

Dynamic recruitment dashboard with:

* Open Roles
* L1 Shortlisted
* L2 Shortlisted
* Offered Candidates
* Candidate Joined
* Positions Closed

Additional analytics:

* Interview Funnel
* Top Hiring Companies
* KPI drill-down navigation

---

## 👥 Candidate Pipeline

Dedicated candidate management module featuring:

* Search & filtering
* Backend-driven pagination
* CSV export
* Deduplication logic
* Recruiter/company filters

### Candidate Table Columns

* Candidate Name
* Phone Number
* Email ID
* Recruiter Name
* Company Name
* Company SPOC

---

## 💼 Jobs Module

ATS-style role tracking system.

### Features

* Open/Closed role tracking
* Recruiter contribution tracking
* CV aggregation
* Joined candidate tracking
* Search & pagination
* CSV export

### Job Metrics

* Total CVs
* Active Candidates
* Joined Candidates
* Recruiter Count

---

## 📑 Reports Module

### Closed Positions

Track successfully completed hiring pipelines.

### Rejection Analysis

Analyze:

* Rejected
* Dropped
* No Response
* Not Interested

### Recruiter Performance

Time-based recruiter analytics:

* Daily
* Weekly
* Monthly

Metrics:

* Total CVs Sent
* Joined Candidates

---

## 📅 Hiring Timeline

Historical recruitment activity tracking.

### Tabs

* Joined Candidates
* Offered Candidates

### Features

* Weekly & Monthly filtering
* Timeline-based analytics
* Search
* CSV export
* Dynamic date filtering

---

## ⚙️ Settings Module

Lightweight local application preferences.

### Features

* Theme preferences
* Compact table mode
* Default pagination size
* Default landing page
* Dataset reset
* Preference persistence via localStorage

---

# 🧠 Smart Excel Processing

HIRESIGHT automatically processes uploaded sourcing tracker Excel files.

## Supported Dynamic Column Matching

Column matching is:

* case-insensitive
* whitespace-safe
* normalization-based

Example:

* `L1 Interview`
* `l1 interview`
* `L1 Status`

All map automatically.

---

# 📂 Expected Excel Columns

```bash
S. no.
CV date to client
Recruiter
Candidate
Phone number
Email ID
Company Role
Company SPOC
L1 Interview
L2 Interview
L3 Interview
Final Feedback
Offered
Joining Date
Joining Status
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* React Context API
* Lucide React Icons

## Backend

* FastAPI
* Pandas
* OpenPyXL

---

# 🧩 Architecture

## Frontend Modules

```bash
dashboard/
jobs/
reports/
candidate-pipeline/
hiring-timeline/
settings/
```

## Backend Modules

```bash
services/
routes/
timeline/
reports/
utils/
```

---

# 📈 Analytics Engine

Built completely using:

* Pandas
* Dynamic dataframe normalization
* Aggregation pipelines
* Status masking
* Timeline filtering
* Role derivation logic

---

# 🔍 Deduplication Logic

Candidates are considered duplicate ONLY IF:

* same email OR same phone
  AND
* same company
  AND
* same role

This preserves:

* multi-role submissions
* multi-company submissions

while preventing accidental duplicate inflation.

---

# 📤 Export Support

Supported across:

* Reports
* Candidate Pipeline
* Hiring Timeline
* Recruiter Performance
* Jobs

Export format:

* CSV

---

# 🎨 UI/UX Highlights

* Premium ATS-inspired design
* Modern SaaS interface
* Collapsible sidebar
* Responsive layout
* Lightweight architecture
* Fast dashboard rendering

---

# ⚡ Performance Highlights

* Backend-driven pagination
* Lazy-loaded reports
* In-memory analytics processing
* Modular architecture
* Dynamic filtering

---

# 🚦 Current Status

## Implemented Modules

✅ Dashboard
✅ Candidate Pipeline
✅ Jobs Module
✅ Reports Module
✅ Hiring Timeline
✅ Recruiter Performance
✅ Settings Page
✅ CSV Export System
✅ Dynamic Excel Upload Engine

---

# 🔮 Planned Future Features

* Google Sheets integration
* Recruiter assignment system
* Charts & trend analytics
* Role-based authentication
* Recruiter personalization
* Advanced recruiter performance metrics
* Email automation

---

# ▶️ Local Setup

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

# 📡 Running URLs

## Live Production URLs

**Frontend (Vercel):**
```bash
https://hiresight-pied.vercel.app
```

**Backend API (Render):**
```bash
https://hiresight-backend-pnan.onrender.com
```

---

## Local Development URLs

**Frontend:**

```bash
http://localhost:3000
```

**Backend:**

```bash
http://localhost:8000
```

---

# 🏢 About HIRESIGHT

HIRESIGHT is designed as an internal recruitment operations platform focused on:

* hiring visibility
* recruiter productivity
* ATS workflow analytics
* operational reporting
* recruitment intelligence

Built for modern hiring teams using Excel-driven sourcing workflows.
