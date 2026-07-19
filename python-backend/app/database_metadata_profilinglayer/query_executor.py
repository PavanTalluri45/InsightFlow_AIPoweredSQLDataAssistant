import logging
from decimal import Decimal
from datetime import date, datetime
from typing import List, Dict, Any
from sqlalchemy import text
from database.connection import engine

logger = logging.getLogger("query_executor")

class QueryExecutor:
    """
    Executes SQL queries safely against Supabase PostgreSQL database.
    
    Provides strict database session protection:
    - Forces read-only transactions at the session level.
    - Limits maximum fetched rows (default 100) to prevent memory exhaustion.
    - Standardizes non-serializable objects (Decimal, dates) to clean JSON types.
    """
    def __init__(self) -> None:
        self.engine = engine

    def execute(self, sql_query: str, max_rows: int = 100) -> List[Dict[str, Any]]:
        """
        Executes a SELECT query under read-only transaction parameters.
        
        Args:
            sql_query (str): The SQL statement to run.
            max_rows (int): Safety cap on rows returned.
            
        Returns:
            List[Dict[str, Any]]: Result rows as dictionary mappings.
        """
        logger.info(f"Preparing execution of query (max_rows={max_rows}): {sql_query.strip()}")
        
        with self.engine.connect() as conn:
            # Begin explicit transaction
            transaction = conn.begin()
            try:
                # 1. Enforce database-level read-only session
                conn.execute(text("SET TRANSACTION READ ONLY;"))
                
                # 2. Execute SQL statement
                result = conn.execute(text(sql_query))
                
                # 3. Check for returned rows
                if result.returns_rows:
                    columns = result.keys()
                    rows = result.fetchmany(max_rows)
                    
                    records = []
                    for row in rows:
                        record = {}
                        for col_name, value in zip(columns, row):
                            # Convert database objects to JSON serializable formats
                            if isinstance(value, Decimal):
                                record[col_name] = float(value)
                            elif isinstance(value, (date, datetime)):
                                record[col_name] = value.isoformat()
                            else:
                                record[col_name] = value
                        records.append(record)
                        
                    transaction.commit()
                    logger.info(f"Query returned {len(records)} records successfully.")
                    return records
                else:
                    # Non-select queries (should be blocked by validator, but in case they execute)
                    transaction.commit()
                    msg = f"Write/DML query completed. Affected rows: {result.rowcount}"
                    logger.warning(msg)
                    return [{"message": msg}]
                    
            except Exception as e:
                transaction.rollback()
                logger.error(f"SQL execution failed: {str(e)}")
                raise e
