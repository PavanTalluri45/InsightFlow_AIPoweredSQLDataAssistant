from typing import Any, Dict, List, Optional, TypedDict


class BackendResponse(TypedDict):
    """Structured return type shared by build_response() and build_error_response()."""
    success: bool
    question: str
    sql: Optional[str]
    execution_time: float
    row_count: int
    data: Optional[List[Dict[str, Any]]]
    answer: Optional[str]
    visualization: Optional[Dict[str, Any]]
    error: Optional[str]


def build_response(
    question: str,
    execution_time: float,
    sql: Optional[str] = None,
    data: Optional[List[Dict[str, Any]]] = None,
    answer: Optional[str] = None,
    visualization: Optional[Dict[str, Any]] = None,
) -> BackendResponse:
    """
    Build the successful backend response contract.

    Args:
        question: The original natural language question.
        execution_time: Total pipeline time in seconds.
        sql: The validated SQL that was executed.
        data: The rows returned by the SQL Executor.
        answer: The plain-language business explanation.
        visualization: The visualization recommendation object from
            visualization_response_builder.build_visualization_response().

    Returns:
        BackendResponse: success=True, with row_count derived from
            len(data) rather than passed in separately, so the two can
            never drift apart.
    """
    rows = data or []
    return {
        "success": True,
        "question": question,
        "sql": sql,
        "execution_time": execution_time,
        "row_count": len(rows),
        "data": rows,
        "answer": answer,
        "visualization": visualization,
        "error": None,
    }


def build_error_response(
    question: str,
    error: str,
    execution_time: float,
    sql: Optional[str] = None,
) -> BackendResponse:
    """
    Build the failure backend response contract.

    Mirrors build_response()'s shape exactly, so every caller (and,
    later, the frontend) deals with one response shape whether the
    pipeline succeeded or not - fields that don't apply on failure
    (data, answer, visualization) are simply None/empty rather than
    missing from the dict.

    Args:
        question: The original natural language question.
        error: A human-readable description of what failed.
        execution_time: Time elapsed before the failure, in seconds.
        sql: The SQL generated so far, if any (e.g. SQL that failed
            validation or execution is still worth returning for
            debugging, even though the query never produced rows).
    """
    return {
        "success": False,
        "question": question,
        "sql": sql,
        "execution_time": execution_time,
        "row_count": 0,
        "data": None,
        "answer": None,
        "visualization": None,
        "error": error,
    }