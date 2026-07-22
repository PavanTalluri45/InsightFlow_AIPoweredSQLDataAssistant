import logging
from typing import List, Dict, Any
from sqlalchemy import text
from database.connection import engine
from app.core.config import SUPPORTED_TABLES

logger = logging.getLogger("database_explorer")

class DatabaseExplorer:
    """
    Handles discovery of high-level database architecture assets:
    database name, table counts, column counts, and row counts.
    
    PostgreSQL queries target standard `information_schema` views:
    - `information_schema.tables` lists available database tables.
    - `information_schema.columns` counts structure elements per table.
    """
    def __init__(self) -> None:
        self.engine = engine

    def get_database_name(self) -> str:
        """
        Retrieves the name of the currently connected database catalog.
        
        Uses PostgreSQL native system function `current_database()`.
        """
        query = text("SELECT current_database();")
        try:
            with self.engine.connect() as conn:
                result = conn.execute(query).scalar()
                return str(result)
        except Exception as e:
            logger.error(f"Failed to query database name: {str(e)}")
            raise e

    def get_table_names(self) -> List[str]:
        """
        Retrieves user-defined table names in the 'public' schema
        that match the supported tables allow-list (SUPPORTED_TABLES).
        
        Queries the SQL-standard 'information_schema.tables' catalog view.
        Filters for schema = 'public', type = 'BASE TABLE', and table_name IN (SUPPORTED_TABLES).
        """
        query = text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
              AND table_name = ANY(:allowed_tables)
            ORDER BY table_name;
        """)
        try:
            with self.engine.connect() as conn:
                result = conn.execute(query, {"allowed_tables": SUPPORTED_TABLES})
                return [row[0] for row in result]
        except Exception as e:
            logger.error(f"Failed to fetch table list from catalogs: {str(e)}")
            raise e

    def get_column_count(self, table_name: str) -> int:
        """
        Retrieves the column count for a specified table.
        
        Args:
            table_name (str): The name of the table to inspect.
            
        Returns:
            int: The number of columns.
        """
        query = text("""
            SELECT count(*) 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = :table_name;
        """)
        try:
            with self.engine.connect() as conn:
                count = conn.execute(query, {"table_name": table_name}).scalar()
                return int(count) if count else 0
        except Exception as e:
            logger.error(f"Failed to count columns for table '{table_name}': {str(e)}")
            raise e

    def get_row_count(self, table_name: str) -> int:
        """
        Retrieves the exact row count for a specified table.
        
        Args:
            table_name (str): The name of the table.
            
        Returns:
            int: Number of rows in the table.
        """
        # Security Guard: Validate table name matches actual database tables
        # because SQL parameters cannot be used for identifiers (table names).
        # This prevents SQL Injection.
        allowed_tables = self.get_table_names()
        if table_name not in allowed_tables:
            error_msg = f"Security Error: Inaccessible or invalid table name '{table_name}'."
            logger.error(error_msg)
            raise ValueError(error_msg)

        query = text(f"SELECT count(*) FROM {table_name};")
        try:
            with self.engine.connect() as conn:
                count = conn.execute(query).scalar()
                return int(count) if count else 0
        except Exception as e:
            logger.error(f"Failed to query row count for table '{table_name}': {str(e)}")
            raise e

    def get_summary(self) -> Dict[str, Any]:
        """
        Gathers high-level summary information about the database schema.
        
        Returns:
            Dict[str, Any]: Contains database name, total tables count,
                            and detailed counts for each table.
        """
        logger.info("Discovering database overview metrics...")
        db_name = self.get_database_name()
        tables = self.get_table_names()
        
        summary = {
            "database_name": db_name,
            "total_tables": len(tables),
            "tables": {}
        }
        
        for table in tables:
            summary["tables"][table] = {
                "row_count": self.get_row_count(table),
                "column_count": self.get_column_count(table)
            }
            
        logger.info(f"Database Explorer: Found {len(tables)} tables in database '{db_name}'.")
        return summary