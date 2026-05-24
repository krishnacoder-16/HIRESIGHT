import io
from services.analytics import process_excel

with open('../Sourcing tracker - Raft Global (1).xlsx', 'rb') as f:
    content = f.read()

res = process_excel(content)
print("Joined count from KPI:", res['kpis']['joined'])
print("Total candidates:", res['kpis']['totalCandidates'])
print("Offered:", res['kpis']['offered'])
print("Rejected:", res['kpis']['rejected'])
print("Active Pipeline:", res['kpis']['activePipeline'])
print("Hold:", res['kpis']['hold'])
