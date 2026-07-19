from typing import List
from sqlalchemy import text
from database.connection import engine
from app.data_cleaning_pipeline.core.entities import SaleRecord
from app.data_cleaning_pipeline.core.interfaces import DataWriter
from app.data_cleaning_pipeline.utils.logger import setup_logger

logger = setup_logger("pg_writer")

class PostgresDataWriter(DataWriter):
    """
    Implements the DataWriter interface to insert and upsert SaleRecord domain entities
    into a Supabase PostgreSQL database.
    """
    def __init__(self, table_name: str = "retail_sales") -> None:
        """
        Initializes the writer with a target database table.
        
        Args:
            table_name (str): The target table name in PostgreSQL.
        """
        self.table_name = table_name

    def create_table_if_not_exists(self) -> None:
        """
        Executes DDL to create the target retail_sales table if it is not present in the DB.
        """
        create_ddl = f"""
        CREATE TABLE IF NOT EXISTS {self.table_name} (
            transaction_id INT PRIMARY KEY,
            date DATE NOT NULL,
            customer_id VARCHAR(50) NOT NULL,
            gender VARCHAR(20) NOT NULL,
            age INT NOT NULL,
            product_category VARCHAR(50) NOT NULL,
            quantity INT NOT NULL,
            price_per_unit NUMERIC(10, 2) NOT NULL,
            total_amount NUMERIC(10, 2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """
        logger.info(f"Checking for database table '{self.table_name}' existence...")
        with engine.connect() as conn:
            transaction = conn.begin()
            try:
                conn.execute(text(create_ddl))
                transaction.commit()
                logger.info(f"Database table '{self.table_name}' is verified and ready.")
            except Exception as e:
                transaction.rollback()
                logger.error(f"Failed to create/verify table '{self.table_name}': {str(e)}")
                raise e

    def write(self, records: List[SaleRecord]) -> int:
        """
        Writes a list of clean SaleRecord objects to PostgreSQL using batch upserts.
        
        Args:
            records (List[SaleRecord]): Clean list of domain records.
            
        Returns:
            int: Number of records written.
        """
        if not records:
            logger.info("No records provided to database writer. Skipping.")
            return 0

        # Ensure target database table is created
        self.create_table_if_not_exists()

        # SQL Upsert query using ON CONFLICT to ensure idempotency
        upsert_query = f"""
        INSERT INTO {self.table_name} (
            transaction_id, date, customer_id, gender, age, 
            product_category, quantity, price_per_unit, total_amount
        ) VALUES (
            :transaction_id, :date, :customer_id, :gender, :age, 
            :product_category, :quantity, :price_per_unit, :total_amount
        )
        ON CONFLICT (transaction_id) DO UPDATE SET
            date = EXCLUDED.date,
            customer_id = EXCLUDED.customer_id,
            gender = EXCLUDED.gender,
            age = EXCLUDED.age,
            product_category = EXCLUDED.product_category,
            quantity = EXCLUDED.quantity,
            price_per_unit = EXCLUDED.price_per_unit,
            total_amount = EXCLUDED.total_amount;
        """

        batch_size = 500
        total_upserted = 0
        logger.info(f"Beginning upsert of {len(records)} records into '{self.table_name}'...")

        with engine.connect() as conn:
            for i in range(0, len(records), batch_size):
                batch = records[i : i + batch_size]
                
                # Transform SaleRecord properties to standard dictionary parameters
                # Note: Decimal values map directly to Postgres Numeric, preserving precision
                parameters = [
                    {
                        "transaction_id": r.transaction_id,
                        "date": r.date,
                        "customer_id": r.customer_id,
                        "gender": r.gender,
                        "age": r.age,
                        "product_category": r.product_category,
                        "quantity": r.quantity,
                        "price_per_unit": r.price_per_unit,
                        "total_amount": r.total_amount
                    }
                    for r in batch
                ]

                transaction = conn.begin()
                try:
                    conn.execute(text(upsert_query), parameters)
                    transaction.commit()
                    total_upserted += len(batch)
                    logger.info(f"Successfully loaded batch: {total_upserted} / {len(records)} records loaded.")
                except Exception as e:
                    transaction.rollback()
                    logger.error(f"Failed to insert batch starting at record index {i}: {str(e)}")
                    raise e

        logger.info(f"Database sync complete. Total rows inserted/updated: {total_upserted}")
        return total_upserted
