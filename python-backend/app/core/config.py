"""
Central configuration settings for the AI SQL Assistant backend.
Single source of truth for supported database tables, default query parameters,
and system-wide constants.
"""

from typing import List, Set

# Central allow-list of tables supported by this assistant.
# Metadata exploration, profiling, schema loading, caching, and SQL validation
# must use this single source of truth.
SUPPORTED_TABLES: List[str] = ["retail_sales"]
SUPPORTED_TABLES_SET: Set[str] = set(SUPPORTED_TABLES)

PRIMARY_TABLE: str = "retail_sales"

DEFAULT_MAX_SQL_LENGTH: int = 5000
