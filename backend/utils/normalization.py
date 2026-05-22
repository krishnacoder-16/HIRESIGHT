import re
import math
from typing import Optional
from utils.config import COLUMN_MAPPING

def normalize_column_name(col_name: str) -> str:
    """
    Normalizes a column name to be case-insensitive, whitespace-agnostic, and underscore-tolerant.
    """
    if not isinstance(col_name, str):
        return str(col_name)
    
    # Lowercase
    normalized = col_name.lower()
    # Replace underscores with spaces
    normalized = normalized.replace('_', ' ')
    # Trim and collapse multiple spaces
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    
    # Map to canonical name if it exists in variations
    for canonical, variations in COLUMN_MAPPING.items():
        if normalized in variations:
            return canonical
            
    return normalized

def normalize_status(status: any) -> Optional[str]:
    """
    Normalizes a status value to be lowercase, trimmed, and null-safe.
    """
    if status is None:
        return None
        
    # Handle NaN floats from pandas safely
    if isinstance(status, float) and math.isnan(status):
        return None
        
    status_str = str(status)
    if status_str.strip() == "" or status_str.lower() in ("nan", "nat", "null", "none"):
        return None
        
    return status_str.lower().strip()
