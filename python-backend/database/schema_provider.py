"""
Single source of truth for the schema description handed to the AI SQL
Generator (via chat_service.process_question -> generate_sql).

This is now backed by the real Database Metadata & Profiling Layer:
  - app/core/cache.py                                  (MetadataCache)
  - app/database_metadata_profilinglayer/metadata.py    (MetadataGenerator)
  - app/database_metadata_profilinglayer/profiler.py     (DatabaseProfiler)
  - app/database_metadata_profilinglayer/explorer.py     (DatabaseExplorer)
  - app/database_metadata_profilinglayer/schema_loader.py (SchemaLoader)

MetadataCache is a process-level singleton. The first call queries
Postgres catalogs (information_schema) and profiles every column;
every call after that is just a dict lookup against the cached result,
so calling get_retail_sales_schema() on every question is cheap after
the first one. See app/core/cache.py's load()/get_metadata() for the
caching mechanics - nothing in this file re-implements or duplicates
that.

IMPORTANT - one real behavior change from the old hardcoded schema
--------------------------------------------------------------------
The previous RETAIL_SALES_SCHEMA constant listed 9 columns and did not
include `created_at`. The live retail_sales table actually has 10
columns - `created_at` (timestamp with time zone) - and it will now
show up here because this reads the real catalog via MetadataCache.
That means the SQL Generator will see a column it didn't know about
before, which can change what SQL it generates. This isn't a bug in
this file - it's exactly what "read the real schema instead of a
hand-maintained copy" is supposed to do - but it IS a change in the
Generator's prompt input, so it's worth confirming that's what you
want before this ships. If you'd rather freeze the old 9-column
behavior, filter `created_at` out in _format_schema_text() below.

Note on error handling
------------------------
get_retail_sales_schema() does NOT catch exceptions from MetadataCache
(e.g. Postgres being unreachable, or "retail_sales" missing from the
catalog). It lets them propagate. chat_service.process_question() now
wraps its call to this function in its own try/except, the same way
it already wraps SQL generation, validation, execution, and
explanation - so a metadata failure surfaces as a normal structured
error response instead of crashing, and instead of silently falling
back to stale data.
"""

from typing import Any, Dict

from app.core.cache import MetadataCache
from app.core.config import PRIMARY_TABLE

TABLE_NAME = PRIMARY_TABLE


def _format_schema_text(table_name: str, table_data: Dict[str, Any]) -> str:
    """
    Render one table's metadata into the plain-text shape sql_prompt.py
    expects: "Table: <name>" followed by one column name per line.

    Only column names are included (matching the old hardcoded
    schema's shape exactly) even though table_data carries much more -
    types, nullability, samples, primary/foreign keys. That richer
    data is available in table_data if you later want to enrich the
    prompt, but that's a deliberate choice to make separately, not a
    side effect of this refactor.
    """
    columns = [col["name"] for col in table_data["columns"]]
    column_lines = "\n".join(columns)
    return f"\nTable: {table_name}\n\nColumns:\n{column_lines}\n"


def get_retail_sales_schema() -> str:
    """
    Return the schema description used to prompt the SQL Generator,
    sourced live from the Metadata & Profiling Layer.

    Returns:
        str: A plain-text schema description for the retail_sales table.

    Raises:
        KeyError: if "retail_sales" is not present in the cached
            metadata (e.g. the table was renamed/dropped).
        Exception: whatever MetadataCache / DatabaseExplorer /
            SchemaLoader / DatabaseProfiler raise while querying
            Postgres (e.g. connection failures). Not caught here -
            see the "Note on error handling" above.
    """
    metadata = MetadataCache().get_metadata()
    table_data = metadata["tables"][TABLE_NAME]
    return _format_schema_text(TABLE_NAME, table_data)