import datetime
import re
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

# ----------------------------------------------------------------------
# Constants & Classification Types
# ----------------------------------------------------------------------

INTENT_TO_CHART: Dict[str, str] = {
    "trend": "line_chart",
    "comparison": "bar_chart",
    "composition": "pie_chart",
    "distribution": "bar_chart",
    "correlation": "scatter_chart",
    "single_value": "kpi",
    "table": "table",
}

DEFAULT_CHART_TYPE = "table"

NUMERIC = "numeric"
DATETIME = "datetime"
CATEGORICAL = "categorical"

MONTH_NAMES = {
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
    "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec"
}


def map_intent_to_chart(intent: str) -> str:
    """Convert a visualization intent into a frontend chart type."""
    return INTENT_TO_CHART.get(intent, DEFAULT_CHART_TYPE)


def _is_date_like_string(val_str: str, col_name: str = "") -> bool:
    """Check if a string represents a date, timestamp, month, or year."""
    cleaned = val_str.strip()
    if not cleaned:
        return False
    
    # ISO date/timestamp format YYYY-MM-DD or YYYY-MM
    if re.match(r"^\d{4}-\d{2}(-\d{2})?([T\s]\d{2}:\d{2}:\d{2})?", cleaned):
        return True
    
    # Month name check
    if cleaned.lower() in MONTH_NAMES:
        return True
    
    # Year format YYYY when column name suggests year
    if re.match(r"^\d{4}$", cleaned) and any(k in col_name.lower() for k in ["year", "yr"]):
        return True

    return False


def _classify_single_value(value: Any, col_name: str = "") -> Optional[str]:
    """Classify a single non-null value into DATETIME, NUMERIC, or CATEGORICAL."""
    if value is None:
        return None
    if isinstance(value, bool):
        return CATEGORICAL
    if isinstance(value, (int, float, Decimal)):
        return NUMERIC
    if isinstance(value, (datetime.date, datetime.datetime)):
        return DATETIME
    if isinstance(value, str) and _is_date_like_string(value, col_name):
        return DATETIME
    return CATEGORICAL


def classify_columns(rows: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Classify every column in rows as 'numeric', 'datetime', or 'categorical'.
    Analyzes Python data types and string date formats across returned rows.
    """
    if not rows:
        return {}

    columns = list(rows[0].keys())
    column_types: Dict[str, str] = {}

    for col in columns:
        resolved_type = CATEGORICAL
        for row in rows:
            val_type = _classify_single_value(row.get(col), col)
            if val_type is not None:
                resolved_type = val_type
                break
        column_types[col] = resolved_type

    return column_types


def analyze_column_semantics(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extract detailed semantic properties from query results:
    - column types
    - distinct value counts (cardinality)
    - separated column lists (datetime_cols, numeric_cols, categorical_cols)
    """
    if not rows:
        return {
            "column_types": {},
            "cardinality": {},
            "datetime_cols": [],
            "numeric_cols": [],
            "categorical_cols": [],
            "total_rows": 0,
        }

    col_types = classify_columns(rows)
    columns = list(rows[0].keys())
    cardinality: Dict[str, int] = {}

    for col in columns:
        distinct_vals = {row.get(col) for row in rows if row.get(col) is not None}
        cardinality[col] = len(distinct_vals)

    datetime_cols = [c for c in columns if col_types[c] == DATETIME]
    numeric_cols = [c for c in columns if col_types[c] == NUMERIC]
    categorical_cols = [c for c in columns if col_types[c] == CATEGORICAL]

    return {
        "column_types": col_types,
        "cardinality": cardinality,
        "datetime_cols": datetime_cols,
        "numeric_cols": numeric_cols,
        "categorical_cols": categorical_cols,
        "total_rows": len(rows),
    }