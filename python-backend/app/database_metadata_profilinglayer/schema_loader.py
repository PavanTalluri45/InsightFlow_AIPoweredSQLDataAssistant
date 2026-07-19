import logging
from typing import List, Dict, Any, Optional
from sqlalchemy import text
from database.connection import engine
from app.database_metadata_profilinglayer.explorer import DatabaseExplorer

logger = logging.getLogger("schema_loader")

class SchemaLoader:
    """
    Retrieves detailed column types, default values, primary keys, and
    foreign key relations dynamically from PostgreSQL catalogs.
    """
    def __init__(self, explorer: Optional[DatabaseExplorer] = None) -> None:
        self.engine = engine
        self.explorer = explorer or DatabaseExplorer()

    def get_columns_schema(self, table_name: str) -> List[Dict[str, Any]]:
        """
        Retrieves schema info (type, nullability, defaults) for all columns of a table.
        
        Args:
            table_name (str): The name of the table.
            
        Returns:
            List[Dict[str, Any]]: List of column descriptions.
        """
        # Security check: verify table existence
        if table_name not in self.explorer.get_table_names():
            error_msg = f"Security Error: Table name '{table_name}' does not exist or is inaccessible."
            logger.error(error_msg)
            raise ValueError(error_msg)

        query = text("""
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' 
              AND table_name = :table_name
            ORDER BY ordinal_position;
        """)

        try:
            with self.engine.connect() as conn:
                result = conn.execute(query, {"table_name": table_name})
                columns = []
                for row in result:
                    columns.append({
                        "name": row[0],
                        "data_type": row[1],
                        "nullable": row[2] == "YES",
                        "default": row[3]
                    })
                return columns
        except Exception as e:
            logger.error(f"Failed to load columns for table '{table_name}': {str(e)}")
            raise e

    def get_primary_keys(self, table_name: str) -> List[str]:
        """
        Retrieves the primary key columns for a specified table.
        
        Queries information_schema constraint catalogs.
        """
        if table_name not in self.explorer.get_table_names():
            raise ValueError(f"Table '{table_name}' does not exist.")

        query = text("""
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY' 
              AND tc.table_schema = 'public' 
              AND tc.table_name = :table_name;
        """)

        try:
            with self.engine.connect() as conn:
                result = conn.execute(query, {"table_name": table_name})
                return [row[0] for row in result]
        except Exception as e:
            logger.error(f"Failed to fetch primary keys for table '{table_name}': {str(e)}")
            raise e

    def get_foreign_keys(self, table_name: str) -> List[Dict[str, Any]]:
        """
        Retrieves foreign key constraints and their relationships.
        
        Returns details on source column, target table, and target column.
        """
        if table_name not in self.explorer.get_table_names():
            raise ValueError(f"Table '{table_name}' does not exist.")

        query = text("""
            SELECT
                kcu.column_name AS source_column,
                ccu.table_name AS target_table,
                ccu.column_name AS target_column
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu 
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND tc.table_schema = 'public' 
              AND tc.table_name = :table_name;
        """)

        try:
            with self.engine.connect() as conn:
                result = conn.execute(query, {"table_name": table_name})
                fkeys = []
                for row in result:
                    fkeys.append({
                        "column": row[0],
                        "referenced_table": row[1],
                        "referenced_column": row[2]
                    })
                return fkeys
        except Exception as e:
            logger.error(f"Failed to fetch foreign keys for table '{table_name}': {str(e)}")
            raise e

    def load_table_schema(self, table_name: str) -> Dict[str, Any]:
        """
        Loads the combined structure of a single table (columns, keys, constraints).
        
        Args:
            table_name (str): Table name.
            
        Returns:
            Dict[str, Any]: Consolidated table schema.
        """
        logger.info(f"Loading granular schema for table '{table_name}'...")
        columns = self.get_columns_schema(table_name)
        primary_keys = self.get_primary_keys(table_name)
        foreign_keys = self.get_foreign_keys(table_name)

        # Annotate primary key property inside column structure for downstream processing
        for col in columns:
            col["is_primary"] = col["name"] in primary_keys

        return {
            "table": table_name,
            "columns": columns,
            "relationships": {
                "primary_keys": primary_keys,
                "foreign_keys": foreign_keys
            }
        }
