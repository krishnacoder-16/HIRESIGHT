# Root Cause Analysis: HIRESIGHT Analytics Discrepancies

This document outlines the root causes for the four major data disparities identified between the HIRESIGHT dashboard and the raw Excel data.

## 🚨 1. Duplicate Profiles (Dashboard: 0 vs Actual: 58)

**Root Cause:**
The `column_has_status` function in `backend/services/analytics.py` uses Pandas' `.isin(status_list)` method to check for duplicates:
```python
return df[col_name].isin(status_list) # where status_list is ["duplicate"]
```
This requires an **exact string match**. If a recruiter enters "Duplicate profile", "Duplicate candidate", or adds any extra text, the exact match fails. Consequently, the dashboard detects 0 duplicates.

Additionally, duplicates are not subtracted from the `totalCandidates` calculation (`len(df)`), artificially inflating the total pipeline numbers and carrying over into downstream metrics.

## 🚨 2. L3 Cleared (Dashboard: 19 vs Actual: 8)

**Root Cause:**
The funnel calculation for "L3 Cleared" is incorrectly mapped to the presence of data in the `final feedback` column:
```python
l3_cleared = int(df['final feedback'].notna().sum())
```
This assumes that reaching the "Final Feedback" stage means the candidate successfully cleared L3. However, candidates can receive final feedback (like "Rejected") without having "cleared" L3. The metric is fundamentally tracking the wrong column for its intended meaning.

## ⚠️ 3. Offered vs. Joined (Dashboard: 1 Offered, 3 Joined)

**Root Cause:**
There are two logical flaws causing this impossible funnel:
1. **Unrecognized Status Values:** The state resolver (`resolve_candidate_final_state`) looks for explicit keywords from the `STATUS_PRIORITY` dictionary (e.g., "offered", "selected", "yes"). The actual `Offered` column often contains **salary packages** (e.g., "15 LPA"). Because "15 LPA" is not in the priority dictionary, it defaults to a priority of 999 (ignored). The 1 "Offered" candidate the dashboard did find likely had the explicit word "offered" written in their `final feedback` column.
2. **Mutually Exclusive Funnel Stages:** The funnel calculates the "Offered" stage by strictly counting candidates whose `final_state` is "offered". If a candidate joins, their `final_state` becomes "joined" (Priority 10). They are then mutually excluded from the "Offered" count, which breaks the standard cumulative nature of a recruitment funnel.

## ⚠️ 4. Positions Closed (Dashboard: 2 vs Actual: 25+)

**Root Cause:**
The system misinterprets what "Positions Closed" means in the context of this data. The current logic assumes it means "Number of unique jobs we successfully filled":
```python
joined_df = df[df['final_state'].isin(JOINED_STATUSES)]
positions_closed = int(joined_df['company role'].nunique())
```
However, the raw data uses "Position Closed" and "Drive Cancelled" as explicit candidate rejection reasons (meaning the requisition was closed before hiring them). The dashboard should be counting the number of candidates who were discarded due to these specific operational statuses.
