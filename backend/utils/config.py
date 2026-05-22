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

# Status Rules
ACTIVE_STATUSES = [
    "shortlisted",
    "interview yet to be scheduled",
    "feedback pending",
    "interview scheduled"
]

HOLD_STATUSES = [
    "hold",
    "client hold",
    "internal hold"
]

REJECTED_STATUSES = [
    "rejected",
    "not interested",
    "dropped",
    "no response"
]

OFFERED_STATUSES = [
    "yes",
    "offered",
    "selected"
]

JOINED_STATUSES = [
    "joined"
]

DUPLICATE_STATUSES = [
    "duplicate"
]
