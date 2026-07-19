import re
import logging
from typing import Tuple

logger = logging.getLogger("sql_validator")

class SQLValidator:
    """
    Validates SQL queries before execution to enforce read-only commands.
    
    Implements a strict multi-layer checking policy:
    1. Removes single-line (--) and multi-line (/* */) comments to prevent bypasses.
    2. Enforces that the query begins with SELECT or WITH (for CTEs).
    3. Performs case-insensitive word-boundary matches to reject write keywords.
    """
    # Regex targeting DML/DDL write keywords with word boundaries
    BLACKLIST_PATTERN = re.compile(
        r"\b(insert|update|delete|drop|alter|truncate|create|replace|grant|revoke|copy|execute)\b",
        re.IGNORECASE
    )

    def strip_comments(self, sql: str) -> str:
        """
        Removes PostgreSQL single-line and multi-line comments from the query.
        
        Args:
            sql (str): Raw SQL statement.
            
        Returns:
            str: SQL query stripped of comments.
        """
        # Remove single-line comments starting with --
        sql = re.sub(r"--.*", "", sql)
        # Remove multi-line comments /* ... */
        sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)
        return sql.strip()

    def validate(self, sql_query: str) -> Tuple[bool, str]:
        """
        Validates whether a SQL query is read-only and safe to execute.
        
        Args:
            sql_query (str): The raw SQL query to test.
            
        Returns:
            Tuple[bool, str]: (isValid: bool, reason: str)
        """
        # Clean comments and whitespace
        cleaned = self.strip_comments(sql_query)
        if not cleaned:
            return False, "Query is empty after comment removal"

        # Split into tokens to inspect the starting command
        tokens = cleaned.split()
        if not tokens:
            return False, "Query has no active statements"

        first_token = tokens[0].upper()
        
        # Enforce that query starts with SELECT or WITH
        if first_token not in ["SELECT", "WITH"]:
            reason = f"Security Violation: Query starts with forbidden keyword '{first_token}'. Only SELECT or WITH (CTEs) are allowed."
            logger.warning(reason)
            return False, reason

        # Enforce write/DML blacklist using word boundaries
        match = self.BLACKLIST_PATTERN.search(cleaned)
        if match:
            forbidden_word = match.group(0).upper()
            reason = f"Security Violation: Query contains blacklisted write command word '{forbidden_word}'."
            logger.warning(reason)
            return False, reason

        return True, "Query is valid and safe (SELECT/WITH only)"
