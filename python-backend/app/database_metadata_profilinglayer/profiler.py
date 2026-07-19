import logging
from typing import Dict, Any, List, Optional
from sqlalchemy import text
from database.connection import engine
from app.database_metadata_profilinglayer.explorer import DatabaseExplorer
from app.database_metadata_profilinglayer.schema_loader import SchemaLoader

logger = logging.getLogger("database_profiler")

class DatabaseProfiler:
    """
    Profiles table columns in PostgreSQL to calculate null counts,
    cardinality, ranges (min/max), averages, and unique samples for categoricals.
    """
    def __init__(
        self,
        explorer: Optional[DatabaseExplorer] = None,
        schema_loader: Optional[SchemaLoader] = None
    ) -> None:
        self.engine = engine
        self.explorer = explorer or DatabaseExplorer()
        self.schema_loader = schema_loader or SchemaLoader(self.explorer)

    def classify_column_type(self, data_type: str) -> str:
        """
        Maps standard PostgreSQL column data types to generic profiling categories.
        
        Args:
            data_type (str): The column data type (e.g. 'integer', 'character varying').
            
        Returns:
            str: Classification ('numeric', 'date', or 'text').
        """
        dt = data_type.lower()
        if any(x in dt for x in ["int", "num", "decimal", "double", "real", "float", "precision", "serial"]):
            return "numeric"
        elif any(x in dt for x in ["date", "time", "timestamp"]):
            return "date"
        else:
            return "text"

    def profile_column(
        self, table_name: str, column_name: str, data_type: str, total_rows: int
    ) -> Dict[str, Any]:
        """
        Runs aggregation queries on a single column to construct a data profile.
        
        Args:
            table_name (str): The validated target table name.
            column_name (str): The column name.
            data_type (str): The SQL data type.
            total_rows (int): The total rows count in the table.
            
        Returns:
            Dict[str, Any]: Profile stats including nulls, distincts, min, max, average, and samples.
        """
        # Escape identifiers to prevent SQL syntax parsing failures
        col_escaped = f'"{column_name}"'
        
        # 1. Base counts
        null_query = text(f"SELECT count(*) FROM {table_name} WHERE {col_escaped} IS NULL;")
        distinct_query = text(f"SELECT count(DISTINCT {col_escaped}) FROM {table_name};")
        
        try:
            with self.engine.connect() as conn:
                null_count = int(conn.execute(null_query).scalar() or 0)
                distinct_count = int(conn.execute(distinct_query).scalar() or 0)
        except Exception as e:
            logger.error(f"Failed to fetch base counts for column '{column_name}': {str(e)}")
            raise e

        # Classify the type
        classification = self.classify_column_type(data_type)

        profile = {
            "null_count": null_count,
            "distinct_count": distinct_count,
            "type_classification": classification,
            "min": None,
            "max": None,
            "average": None,
            "sample_values": []
        }

        # 2. Extract numeric statistics
        if classification == "numeric" and total_rows > 0:
            stats_query = text(f"SELECT min({col_escaped}), max({col_escaped}), avg({col_escaped}) FROM {table_name};")
            try:
                with self.engine.connect() as conn:
                    result = conn.execute(stats_query).fetchone()
                    if result:
                        profile["min"] = float(result[0]) if result[0] is not None else None
                        profile["max"] = float(result[1]) if result[1] is not None else None
                        profile["average"] = float(result[2]) if result[2] is not None else None
            except Exception as e:
                logger.warning(f"Could not compute numeric stats on column '{column_name}': {str(e)}")

        # 3. Extract date statistics
        elif classification == "date" and total_rows > 0:
            stats_query = text(f"SELECT min({col_escaped}), max({col_escaped}) FROM {table_name};")
            try:
                with self.engine.connect() as conn:
                    result = conn.execute(stats_query).fetchone()
                    if result:
                        profile["min"] = str(result[0]) if result[0] is not None else None
                        profile["max"] = str(result[1]) if result[1] is not None else None
            except Exception as e:
                logger.warning(f"Could not compute date stats on column '{column_name}': {str(e)}")

        # 4. Check for Categorical classification and retrieve sample values
        # If cardinality is small (<= 20) or less than 10% of records, we classify as categorical
        is_low_cardinality = distinct_count <= 20 or (total_rows > 0 and (distinct_count / total_rows) <= 0.05)
        if classification == "text" and is_low_cardinality:
            profile["type_classification"] = "categorical"
            
        if profile["type_classification"] == "categorical" and distinct_count > 0:
            sample_query = text(f"SELECT DISTINCT {col_escaped} FROM {table_name} WHERE {col_escaped} IS NOT NULL ORDER BY {col_escaped} LIMIT 10;")
            try:
                with self.engine.connect() as conn:
                    result = conn.execute(sample_query)
                    profile["sample_values"] = [str(row[0]) for row in result]
            except Exception as e:
                logger.warning(f"Could not query sample values for column '{column_name}': {str(e)}")

        return profile

    def profile_table(self, table_name: str) -> Dict[str, Any]:
        """
        Profiles all columns in a table and aggregates the metrics.
        
        Args:
            table_name (str): Table name.
            
        Returns:
            Dict[str, Any]: Column profiles and total row count.
        """
        # Ensure security check on table name
        allowed_tables = self.explorer.get_table_names()
        if table_name not in allowed_tables:
            raise ValueError(f"Table name '{table_name}' does not exist or is inaccessible.")

        total_rows = self.explorer.get_row_count(table_name)
        columns = self.schema_loader.get_columns_schema(table_name)
        
        logger.info(f"Profiling table '{table_name}' ({total_rows} rows)...")
        column_profiles = {}
        
        for col in columns:
            col_name = col["name"]
            data_type = col["data_type"]
            column_profiles[col_name] = self.profile_column(table_name, col_name, data_type, total_rows)

        return {
            "table_name": table_name,
            "row_count": total_rows,
            "columns": column_profiles
        }

    def profile_database(self) -> Dict[str, Any]:
        """
        Profiles all user tables in the database.
        
        Returns:
            Dict[str, Any]: Combined database profiles dictionary.
        """
        tables = self.explorer.get_table_names()
        logger.info(f"Starting database profiling run for tables: {tables}")
        
        profile = {}
        for table in tables:
            profile[table] = self.profile_table(table)
            
        logger.info("Database profiling run successfully complete.")
        return profile
