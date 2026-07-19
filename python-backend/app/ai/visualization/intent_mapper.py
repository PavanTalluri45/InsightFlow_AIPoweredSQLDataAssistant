import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

# ----------------------------------------------------------------------
# Intent -> chart type 
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

# Rule: any intent this module doesn't recognize maps to a plain
# table rather than raising - an unknown intent should degrade
# gracefully, not break the pipeline.
DEFAULT_CHART_TYPE = "table"


def map_intent_to_chart(intent: str) -> str:
    """
    Convert a visualization intent into a frontend chart type.

    Args:
        intent: One of the allowed intents produced by
            visualization_selector.select_visualization().

    Returns:
        str: The mapped chart type (e.g. "line_chart"), or "table" if
            the intent is missing from INTENT_TO_CHART.
    """
    return INTENT_TO_CHART.get(intent, DEFAULT_CHART_TYPE)


# ----------------------------------------------------------------------
# Column type classification (new)
# ----------------------------------------------------------------------

NUMERIC = "numeric"
DATETIME = "datetime"
CATEGORICAL = "categorical"


def _classify_single_value(value: Any) -> Optional[str]:
    """
    Classify one non-null value's Python type.

    Returns:
        Optional[str]: "numeric" | "datetime" | "categorical", or None
            if the value itself is None (so callers can skip nulls
            when deciding a column's dominant type).

    Notes:
        - Booleans are deliberately treated as categorical, not
          numeric, even though `bool` is a subclass of `int` in
          Python - a True/False column should never become a chart's
          numeric axis.
        - Decimal is included because psycopg2/SQLAlchemy return
          NUMERIC/DECIMAL Postgres columns as Python Decimal, not
          float.
        - datetime.datetime is checked before datetime.date only for
          clarity; datetime.datetime is itself a subclass of
          datetime.date, so a single isinstance check against
          datetime.date already covers both.
    """
    if value is None:
        return None
    if isinstance(value, bool):
        return CATEGORICAL
    if isinstance(value, (int, float, Decimal)):
        return NUMERIC
    if isinstance(value, (datetime.date, datetime.datetime)):
        return DATETIME
    return CATEGORICAL


def classify_columns(rows: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Classify every column in `rows` as "numeric", "datetime", or
    "categorical", based on the actual Python types the SQL Executor
    returned - never by guessing from column names, and never by
    asking Gemini.

    A column's type is decided by its first non-null value, on the
    assumption that a column is type-consistent across rows (true for
    SQL result sets, since every value in a column comes from the same
    typed database column). A column that is NULL in every row falls
    back to "categorical" as a safe default, since it can't be used as
    a numeric or datetime axis regardless.

    I'm fairly confident this matches standard psycopg2/SQLAlchemy
    behavior (NUMERIC -> Decimal, DATE/TIMESTAMP -> date/datetime,
    everything textual -> str), but the exact Python type returned per
    Postgres column type is ultimately driver-dependent - worth a
    quick sanity check against your actual query results if a column
    ever gets classified unexpectedly.

    Args:
        rows: The rows returned by the SQL Executor (list of dicts).

    Returns:
        Dict[str, str]: column name -> "numeric" | "datetime" |
            "categorical", in the same column order as the first row.
    """
    if not rows:
        return {}

    columns = list(rows[0].keys())
    column_types: Dict[str, str] = {}

    for column in columns:
        resolved_type = CATEGORICAL
        for row in rows:
            value_type = _classify_single_value(row.get(column))
            if value_type is not None:
                resolved_type = value_type
                break
        column_types[column] = resolved_type

    return column_types