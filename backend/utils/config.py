# Configuration for Status Rules and Column Mappings

# Column mapping: Normalized standard name -> list of potential variations
COLUMN_MAPPING = {
    "email id": ["email id", "emailid", "email"],
    "joining status": ["joining status", "joiningstatus", "status of joining"],
    "company role": ["company role", "role"],
    "offered": ["offered", "offer status", "offer"],
    "l1 interview": ["l1 interview", "l1", "round 1", "first round"],
    "l2 interview": ["l2 interview", "l2", "round 2", "second round"],
    "l3 interview": ["l3 interview", "l3", "round 3", "third round"],
    "final feedback": ["final feedback", "feedback", "status", "current status"],
    "candidate": ["candidate", "candidate name", "name"],
    "recruiter": ["recruiter", "recruiter name", "sourcer"]
}

# Status Priority Mapping (Lower number = Higher Priority)
STATUS_PRIORITY = {
    # 1. Joined
    "joined": 10,
    # "position closed" / "position_closed" intentionally unclassified — counted in total only
    
    # 2. Offered
    "offered": 20, "yes": 20, "selected": 20,
    
    # 3. Rejected / Drop / Not Interested
    "rejected": 30,
    "candidate_drop": 31, "candidate drop": 31, "dropped": 31,
    "not_interested": 32, "not interested": 32,
    # Bug Fix: removed "position_closed"/"position closed" — moved to tier 1 (joined)
    "drive_cancelled": 34, "drive cancelled": 34,
    "no response": 35,
    
    # 4. Hold
    "hold": 40, "client hold": 40, "internal hold": 40,
    
    # 5. Pipeline / Active
    "shortlisted": 50,
    "in discussion": 51,
    "pending": 60, 
    "feedback pending": 60, 
    "interview yet to be schedule": 60, 
    "interview scheduled": 60, 
    "tech 2 need to schedule": 60, 
    "no update": 60,
}

# Status Rules for KPIs
ACTIVE_STATUSES = [
    # Bug Fix 5: removed "hold" — hold is a separate KPI, not an active-pipeline status
    "shortlisted",
    "pending",
    "no update",
    "interview yet to be schedule",
    "feedback pending",
    "in discussion",
    "tech 2 need to schedule"
]

HOLD_STATUSES = [
    "hold",
    "client hold",
    "internal hold"
]

REJECTED_STATUSES = [
    "rejected",
    "not interested",
    "not_interested",
    "dropped",
    "candidate_drop",
    "candidate drop",
    "no response",
    # Bug Fix 6: removed "position closed", "position_closed", "drive cancelled", "drive_cancelled"
    # Per business logic: "position closed" → JOINED; "drive cancelled" → POSITIONS CLOSED metric only
]

OFFERED_STATUSES = [
    "yes",
    "offered",
    "selected"
]

JOINED_STATUSES = [
    "joined",
    # "position closed" intentionally excluded — counts in total candidates only, no KPI category
]

DUPLICATE_STATUSES = [
    "duplicate"
]

# Recruiter Workflow Stage Columns (canonical normalized names)
WORKFLOW_STAGE_COLUMNS = [
    "joining status",
    "l3 interview",
    "l2 interview",
    "l1 interview",
    "final feedback"
]
