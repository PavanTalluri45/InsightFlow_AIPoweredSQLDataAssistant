from typing import Any, Dict, List, Optional
from app.ai.visualization.intent_mapper import analyze_column_semantics


def table_presentation_response(reason: str, goal: str = "LIST_RECORDS") -> Dict[str, Any]:
    """
    Return the standard contract when presentation is TABLE.
    All chart attributes return null.
    """
    return {
        "presentation": "table",
        "goal": goal,
        "chart_type": None,
        "title": None,
        "x_axis": None,
        "y_axis": None,
        "series": None,
        "legend": None,
        "stacked": None,
        "horizontal": None,
        "sort": None,
        "reason": reason or "Query results are presented in tabular format.",
    }


def disabled_visualization_response(reason: str) -> Dict[str, Any]:
    """Legacy helper fallback mapping to table presentation."""
    return table_presentation_response(reason=reason, goal="LIST_RECORDS")


def _default_title(question: str) -> str:
    """Derive a human-readable title from the user question."""
    cleaned = question.strip().rstrip("?").strip()
    if not cleaned:
        return "Query Result"
    return cleaned[0].upper() + cleaned[1:]


def build_visualization_response(
    question: str,
    goal_result: Dict[str, Any],
    rows: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Visualization Planner (Deterministic Python Engine).

    Determines presentation type (TABLE, KPI, CHART), chart selection, axes,
    grouping/series, legends, orientation, and sorting from:
      - Question semantics
      - Analytical Goal (Gemini output)
      - SQL result data types, cardinality, and column structures
    """
    goal = goal_result.get("goal", "UNKNOWN")
    reason = goal_result.get("reason", "")

    if not rows:
        return table_presentation_response(
            reason=reason or "No query results to display.",
            goal=goal,
        )

    # 1. Direct Table Presentation for Record Listings
    if goal == "LIST_RECORDS":
        return table_presentation_response(
            reason=reason or "Detailed record listing requested by user.",
            goal="LIST_RECORDS",
        )

    title = _default_title(question)
    semantics = analyze_column_semantics(rows)

    datetime_cols = semantics["datetime_cols"]
    numeric_cols = semantics["numeric_cols"]
    categorical_cols = semantics["categorical_cols"]
    cardinality = semantics["cardinality"]

    q_lower = question.lower()
    is_top_n_question = any(kw in q_lower for kw in ["top", "highest", "best", "rank"])
    is_bottom_n_question = any(kw in q_lower for kw in ["bottom", "lowest", "worst"])

    # 2. KPI / Single Value Presentation
    if goal == "SHOW_SINGLE_VALUE" or (
        len(rows) == 1 and len(numeric_cols) >= 1 and not categorical_cols and not datetime_cols
    ):
        y_col = numeric_cols[0] if numeric_cols else (list(rows[0].keys())[0] if rows else None)
        if not y_col:
            return table_presentation_response("No metric column available for KPI card.", goal=goal)
        return {
            "presentation": "kpi",
            "goal": "SHOW_SINGLE_VALUE",
            "chart_type": "kpi",
            "title": title,
            "x_axis": None,
            "y_axis": y_col,
            "series": None,
            "legend": False,
            "stacked": False,
            "horizontal": False,
            "sort": None,
            "reason": reason or "Single aggregate metric presented as a KPI card.",
        }

    # 3. Time Series / Trend Presentation (Line Chart)
    if goal in ("SHOW_TREND", "SHOW_TIME_SERIES") or (len(datetime_cols) > 0 and len(numeric_cols) >= 1):
        x_col = datetime_cols[0] if datetime_cols else (categorical_cols[0] if categorical_cols else None)
        y_col = numeric_cols[0] if numeric_cols else None

        if x_col and y_col:
            series_col = None
            legend = False
            if categorical_cols and categorical_cols[0] != x_col:
                series_col = categorical_cols[0]
                legend = True
            elif len(categorical_cols) >= 2:
                series_col = categorical_cols[1]
                legend = True

            return {
                "presentation": "chart",
                "goal": goal if goal != "UNKNOWN" else "SHOW_TREND",
                "chart_type": "line_chart",
                "title": title,
                "x_axis": x_col,
                "y_axis": y_col,
                "series": series_col,
                "legend": legend,
                "stacked": False,
                "horizontal": False,
                "sort": "asc",
                "reason": reason or "Temporal trend analysis presented as a line chart.",
            }

    # 4. Composition Presentation (Pie Chart vs Horizontal Bar Chart)
    if goal == "SHOW_COMPOSITION":
        x_col = categorical_cols[0] if categorical_cols else None
        y_col = numeric_cols[0] if numeric_cols else None

        if x_col and y_col:
            x_cardinality = cardinality.get(x_col, 0)
            if x_cardinality <= 7:
                return {
                    "presentation": "chart",
                    "goal": "SHOW_COMPOSITION",
                    "chart_type": "pie_chart",
                    "title": title,
                    "x_axis": x_col,
                    "y_axis": y_col,
                    "series": None,
                    "legend": True,
                    "stacked": False,
                    "horizontal": False,
                    "sort": "desc",
                    "reason": reason or "Part-to-whole share breakdown presented as a pie chart.",
                }
            else:
                return {
                    "presentation": "chart",
                    "goal": "SHOW_COMPOSITION",
                    "chart_type": "bar_chart",
                    "title": title,
                    "x_axis": x_col,
                    "y_axis": y_col,
                    "series": None,
                    "legend": False,
                    "stacked": False,
                    "horizontal": True,
                    "sort": "desc",
                    "reason": f"{reason} High cardinality composition presented as a horizontal bar chart.",
                }

    # 5. Relationship / Correlation Presentation (Scatter Chart)
    if goal == "SHOW_RELATIONSHIP":
        if len(numeric_cols) >= 2:
            return {
                "presentation": "chart",
                "goal": "SHOW_RELATIONSHIP",
                "chart_type": "scatter_chart",
                "title": title,
                "x_axis": numeric_cols[0],
                "y_axis": numeric_cols[1],
                "series": None,
                "legend": False,
                "stacked": False,
                "horizontal": False,
                "sort": None,
                "reason": reason or "Relationship between numeric metrics presented as a scatter chart.",
            }

    # 6. Ranking / Top N / Bottom N Presentation (Horizontal Bar Chart)
    if goal in ("SHOW_RANKING", "SHOW_TOP_N", "SHOW_BOTTOM_N") or is_top_n_question or is_bottom_n_question:
        x_col = categorical_cols[0] if categorical_cols else (datetime_cols[0] if datetime_cols else None)
        y_col = numeric_cols[0] if numeric_cols else None

        if x_col and y_col:
            sort_order = "asc" if (goal == "SHOW_BOTTOM_N" or is_bottom_n_question) else "desc"
            return {
                "presentation": "chart",
                "goal": goal if goal != "UNKNOWN" else "SHOW_RANKING",
                "chart_type": "bar_chart",
                "title": title,
                "x_axis": x_col,
                "y_axis": y_col,
                "series": None,
                "legend": False,
                "stacked": False,
                "horizontal": True,
                "sort": sort_order,
                "reason": reason or "Ranked comparison presented as a horizontal bar chart.",
            }

    # 7. Category Comparison / Distribution Presentation (Bar Chart)
    y_col = numeric_cols[0] if numeric_cols else None

    # Grouped Bar Chart (2 categorical columns)
    if len(categorical_cols) >= 2 and y_col:
        x_col = categorical_cols[0]
        series_col = categorical_cols[1]
        return {
            "presentation": "chart",
            "goal": goal if goal != "UNKNOWN" else "COMPARE_VALUES",
            "chart_type": "bar_chart",
            "title": title,
            "x_axis": x_col,
            "y_axis": y_col,
            "series": series_col,
            "legend": True,
            "stacked": False,
            "horizontal": False,
            "sort": None,
            "reason": reason or "Multi-dimensional comparison presented as a grouped bar chart.",
        }

    # Standard Bar Chart (1 dimension + 1 measure)
    x_col = categorical_cols[0] if categorical_cols else (datetime_cols[0] if datetime_cols else None)
    if x_col and y_col:
        x_cardinality = cardinality.get(x_col, 0)
        horizontal = x_cardinality > 8

        return {
            "presentation": "chart",
            "goal": goal if goal != "UNKNOWN" else "COMPARE_VALUES",
            "chart_type": "bar_chart",
            "title": title,
            "x_axis": x_col,
            "y_axis": y_col,
            "series": None,
            "legend": False,
            "stacked": False,
            "horizontal": horizontal,
            "sort": None,
            "reason": reason or "Category comparison presented as a bar chart.",
        }

    # Fallback to Table if numeric and dimension columns cannot be mapped to a chart
    return table_presentation_response(
        reason=f"{reason} Query result layout is best suited for tabular inspection.",
        goal=goal,
    )