from typing import Any, Dict, List, Optional, Set, Tuple
from app.ai.visualization.intent_mapper import (
    CATEGORICAL,
    DATETIME,
    NUMERIC,
    classify_columns,
)

# Which of x_axis / y_axis a given chart type actually needs populated
# in order to be considered valid. "table" needs neither. "kpi" only
# needs a value (stored in y_axis; x_axis is intentionally left None
# for a single-value chart - there's nothing to plot it against).
_REQUIRED_AXES: Dict[str, Tuple[str, ...]] = {
    "bar_chart": ("x_axis", "y_axis"),
    "line_chart": ("x_axis", "y_axis"),
    "pie_chart": ("x_axis", "y_axis"),
    "scatter_chart": ("x_axis", "y_axis"),
    "kpi": ("y_axis",),
    "table": (),
}


def _default_title(question: str) -> str:
    """Derive a fallback title from the question when none is supplied."""
    cleaned = question.strip().rstrip("?").strip()
    if not cleaned:
        return "Query Result"
    return cleaned[0].upper() + cleaned[1:]


def _first_column(
    column_types: Dict[str, str],
    wanted_type: str,
    exclude: Optional[Set[str]] = None,
) -> Optional[str]:
    """
    Return the first column name (in row order) classified as
    `wanted_type`, skipping any column names in `exclude`.

    Returns None if no matching column exists - callers treat that as
    "this chart type can't be satisfied by this data".
    """
    exclude = exclude or set()
    for name, ctype in column_types.items():
        if ctype == wanted_type and name not in exclude:
            return name
    return None


def _select_bar_axes(column_types: Dict[str, str]) -> Tuple[Optional[str], Optional[str]]:
    """Bar chart: X = categorical, Y = numeric."""
    x_axis = _first_column(column_types, CATEGORICAL)
    y_axis = _first_column(column_types, NUMERIC)
    return x_axis, y_axis


def _select_line_axes(column_types: Dict[str, str]) -> Tuple[Optional[str], Optional[str]]:
    """
    Line chart: X = datetime, or "ordered categorical" as a fallback.

    Note: a categorical column's ordering can't actually be verified
    from its Python type alone (e.g. a month-name column vs. a
    genuinely unordered category column look identical to
    classify_columns()). Falling back to the first categorical column
    when no datetime column exists is a deliberate heuristic, not a
    guarantee of true chronological order - worth eyeballing the
    result for time-series questions where the schema has no real
    date/timestamp column.
    """
    x_axis = _first_column(column_types, DATETIME)
    if x_axis is None:
        x_axis = _first_column(column_types, CATEGORICAL)
    y_axis = _first_column(column_types, NUMERIC)
    return x_axis, y_axis


def _select_pie_axes(column_types: Dict[str, str]) -> Tuple[Optional[str], Optional[str]]:
    """Pie chart: labels = categorical, values = numeric (stored as x_axis/y_axis)."""
    labels = _first_column(column_types, CATEGORICAL)
    values = _first_column(column_types, NUMERIC)
    return labels, values


def _select_scatter_axes(column_types: Dict[str, str]) -> Tuple[Optional[str], Optional[str]]:
    """Scatter chart: X = numeric, Y = a *different* numeric column."""
    x_axis = _first_column(column_types, NUMERIC)
    exclude = {x_axis} if x_axis else None
    y_axis = _first_column(column_types, NUMERIC, exclude=exclude)
    return x_axis, y_axis


def _select_kpi_axis(column_types: Dict[str, str]) -> Tuple[Optional[str], Optional[str]]:
    """KPI: a single numeric value. x_axis is intentionally always None."""
    value_column = _first_column(column_types, NUMERIC)
    return None, value_column


_AXIS_SELECTORS = {
    "bar_chart": _select_bar_axes,
    "line_chart": _select_line_axes,
    "pie_chart": _select_pie_axes,
    "scatter_chart": _select_scatter_axes,
    "kpi": _select_kpi_axis,
}


def _select_axes_for_chart(
    chart_type: str, rows: List[Dict[str, Any]]
) -> Tuple[Optional[str], Optional[str]]:
    """
    Look up the axis selector for `chart_type` and run it against the
    rows' classified column types. "table" (or any chart type without
    a registered selector) has no axes by definition.
    """
    selector = _AXIS_SELECTORS.get(chart_type)
    if selector is None:
        return None, None

    column_types = classify_columns(rows)
    return selector(column_types)


def _missing_required_axes(
    chart_type: str, x_axis: Optional[str], y_axis: Optional[str]
) -> List[str]:
    """Return which of this chart type's required axes came back None."""
    axis_values = {"x_axis": x_axis, "y_axis": y_axis}
    required = _REQUIRED_AXES.get(chart_type, ())
    return [name for name in required if axis_values[name] is None]


def build_visualization_response(
    question: str,
    intent_result: Dict[str, Any],
    chart_type: str,
    rows: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Assemble the visualization object the frontend will consume.

    Args:
        question: The original natural language question.
        intent_result: The dict returned by
            visualization_selector.select_visualization() - expected
            to contain "required", "intent", and "reason".
        chart_type: The chart type returned by
            intent_mapper.map_intent_to_chart(intent_result["intent"]).
        rows: The SQL result rows, used to classify columns and pick
            axes.

    Returns:
        dict: {
            "required": bool,
            "intent": str,
            "chart_type": str,
            "title": str,
            "x_axis": Optional[str],
            "y_axis": Optional[str],
            "reason": str,
        }

        If Gemini's classified chart type can't actually be satisfied
        by the returned columns (missing categorical/numeric/datetime
        column of the required kind), this downgrades to
        chart_type="table", required=False, with both axes None -
        rather than shipping a chart with a missing or semantically
        wrong axis.
    """
    required = bool(intent_result.get("required", False))
    intent = intent_result.get("intent") or "table"
    reason = intent_result.get("reason", "")
    title = _default_title(question)

    if not required or not rows:
        return {
            "required": False,
            "intent": intent,
            "chart_type": "table",
            "title": title,
            "x_axis": None,
            "y_axis": None,
            "reason": reason,
        }

    x_axis, y_axis = _select_axes_for_chart(chart_type, rows)
    missing = _missing_required_axes(chart_type, x_axis, y_axis)

    if missing:
        return {
            "required": False,
            "intent": intent,
            "chart_type": "table",
            "title": title,
            "x_axis": None,
            "y_axis": None,
            "reason": (
                f"{reason} A {chart_type.replace('_', ' ')} needs a "
                f"{'/'.join(missing)} the returned columns don't have, "
                "so a table is shown instead."
            ).strip(),
        }

    return {
        "required": True,
        "intent": intent,
        "chart_type": chart_type,
        "title": title,
        "x_axis": x_axis,
        "y_axis": y_axis,
        "reason": reason,
    }