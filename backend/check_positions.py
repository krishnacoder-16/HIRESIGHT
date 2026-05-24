import io
import pandas as pd
from utils.normalization import normalize_column_name, normalize_status

with open('../Sourcing tracker - Raft Global (1).xlsx', 'rb') as f:
    df = pd.read_excel(io.BytesIO(f.read()))

df.columns = [normalize_column_name(col) for col in df.columns]

def text_in_any_col(text_list):
    mask = pd.Series([False] * len(df), index=df.index)
    for col in df.columns:
        for text in text_list:
            mask = mask | df[col].astype(str).str.contains(text, case=False, na=False)
    return mask

drive_cancelled_mask = text_in_any_col(['drive cancelled', 'drive_cancelled'])
position_closed_mask = text_in_any_col(['position closed', 'position_closed'])
joined_mask = text_in_any_col(['joined']) & ~text_in_any_col(['not joined', 'did not join', "didn't join", 'decline'])

closed_mask = drive_cancelled_mask | position_closed_mask | joined_mask

closed_df = df[closed_mask]
print("Number of candidate rows marked closed/cancelled/joined:", len(closed_df))
if 'company role' in closed_df.columns:
    print("Distinct roles marked closed:")
    print(closed_df.groupby('company role').size())
