from typing import Any, Dict, List, Optional, TypedDict

from sqlalchemy import text
from sqlalchemy.exc import (
    DBAPIError,
    OperationalError,
    ProgrammingError,
    SQLAlchemyError,
)
from sqlalchemy.exc import TimeoutError as PoolTimeoutError
from database.connection import engine


class ExecutionResult(TypedDict):
    """Structured return type for execute_query()."""
    success: bool
    data: Optional[List[Dict[str, Any]]]
    row_count: int
    error: Optional[str]


# ----------------------------------------------------------------------
# Internal helpers (single responsibility each)
# ----------------------------------------------------------------------

def _run_statement(sql: str) -> List[Dict[str, Any]]:
    """
    Open a connection from the shared engine, execute the SQL, and
    convert every returned row into a plain dictionary.

    The connection is used as a context manager so it is always
    released back to the pool - whether execution succeeds or raises.
    This is the "open cursor -> execute -> fetch -> close" sequence,
    expressed through SQLAlchemy's connection/result API rather than a
    raw DBAPI cursor.
    """
    with engine.connect() as connection:
        result = connection.execute(text(sql))
        return _rows_to_dicts(result)


def _rows_to_dicts(result) -> List[Dict[str, Any]]:
    """
    Convert a SQLAlchemy Result into a list of plain dictionaries,
    keyed by column name. Never returns tuples or driver objects.
    """
    return [dict(row) for row in result.mappings().all()]


def _success_response(data: List[Dict[str, Any]]) -> ExecutionResult:
    """Build the structured success response."""
    return {
        "success": True,
        "data": data,
        "row_count": len(data),
        "error": None,
    }


def _error_response(message: str) -> ExecutionResult:
    """Build the structured failure response."""
    return {
        "success": False,
        "data": None,
        "row_count": 0,
        "error": message,
    }


# ----------------------------------------------------------------------
# Public entry point
# ----------------------------------------------------------------------

def execute_query(sql: str) -> ExecutionResult:
    """
    Execute already-validated SQL against Supabase PostgreSQL.

    This function does not validate, sanitize, or modify the SQL it
    receives - that responsibility belongs entirely to
    app/ai/sql_validator.py and must have already run before this
    function is called. This function never raises; every failure
    mode is caught and returned as a structured error.

    Args:
        sql: Validated SQL string (SELECT only, enforced upstream).

    Returns:
        ExecutionResult: a dict of the form
            {"success": True,  "data": [...], "row_count": N, "error": None}
        or
            {"success": False, "data": None,  "row_count": 0, "error": "<reason>"}
    """
    try:
        data = _run_statement(sql)
        return _success_response(data)

    except PoolTimeoutError as e:
        # Connection pool could not hand out a connection in time.
        return _error_response(f"Database connection timed out: {e}")

    except OperationalError as e:
        # Covers connection failures, network issues, and PostgreSQL
        # statement_timeout cancellations surfaced by the driver.
        return _error_response(f"Database connection error: {e}")

    except ProgrammingError as e:
        # Covers invalid/malformed SQL rejected by PostgreSQL itself.
        return _error_response(f"Invalid SQL: {e}")

    except DBAPIError as e:
        # Covers lower-level driver/cursor errors not already caught
        # by the more specific exceptions above.
        return _error_response(f"Execution error: {e}")

    except SQLAlchemyError as e:
        # Catch-all for any other SQLAlchemy-raised error.
        return _error_response(f"Database error: {e}")

    except Exception as e:
        # Final safety net - execute_query must never crash the caller.
        return _error_response(f"Unexpected error: {e}")