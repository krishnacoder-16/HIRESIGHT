import services.store as store
from services.reports.closed_positions import _get_closed_positions_df
from services.reports.internal_closures import _get_internal_closures_df

def get_reports_summary() -> dict:
    has_dataset = store.state.get("normalized_dataframe") is not None
    if not has_dataset:
        return {
            "closedPositionsCount": 0,
            "internalClosuresCount": 0,
            "hasDataset": False
        }
    
    closed_df = _get_closed_positions_df()
    internal_df = _get_internal_closures_df()
    
    return {
        "closedPositionsCount": len(closed_df),
        "internalClosuresCount": len(internal_df),
        "hasDataset": True
    }
