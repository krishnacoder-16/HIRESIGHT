import pandas as pd

# Global state to store session data in-memory
# Do not mutate these dataframes directly when querying
state = {
    "raw_dataframe": None,       # Raw cleaned dataframe for analytics KPIs
    "candidate_dataframe": None, # Deduplicated dataframe for candidate pipeline table
    "analytics": None            # Processed analytics JSON payload for rehydration
}
