import sys
from pathlib import Path
from app.data_cleaning_pipeline.infrastructure.pandas_reader import PandasDataReader
from app.data_cleaning_pipeline.infrastructure.retail_validator import RetailValidator
from app.data_cleaning_pipeline.infrastructure.retail_transformer import RetailTransformer
from app.data_cleaning_pipeline.infrastructure.pg_writer import PostgresDataWriter
from app.data_cleaning_pipeline.application.pipeline_use_case import CleanSalesPipeline
from app.data_cleaning_pipeline.utils.logger import setup_logger

logger = setup_logger("run_pipeline")

def main() -> None:
    """
    Main entry point for running the Retail Sales ETL Data Cleaning Pipeline.
    Instantiates components and executes the workflow with Dependency Injection.
    """
    # Resolve project directories dynamically based on the script location
    # __file__ is in python-backend/app/data_cleaning_pipeline/run.py
    pipeline_dir = Path(__file__).resolve().parent
    backend_dir = pipeline_dir.parent.parent
    
    raw_csv_path = backend_dir / "dataset" / "raw" / "retail_sales_dataset.csv"
    invalid_csv_path = backend_dir / "dataset" / "raw" / "invalid_sales_records.csv"

    # Support dry-run via command-line arguments
    dry_run = "--dry-run" in sys.argv

    logger.info("==================================================================")
    logger.info("Initializing Retail Sales ETL Execution Script")
    logger.info(f"Target Database Table: retail_sales")
    logger.info(f"Dry Run Mode: {dry_run}")
    logger.info("==================================================================")

    # 1. Dependency Injection setup
    reader = PandasDataReader(file_path=raw_csv_path)
    validator = RetailValidator()
    transformer = RetailTransformer()
    writer = PostgresDataWriter(table_name="retail_sales")

    # 2. Build Pipeline Orchestrator
    pipeline = CleanSalesPipeline(
        reader=reader,
        validator=validator,
        transformer=transformer,
        writer=writer,
        invalid_records_output_path=invalid_csv_path
    )

    # 3. Execute
    try:
        summary = pipeline.execute(dry_run=dry_run)
        logger.info("ETL script executed successfully.")
        logger.info(f"Summary Results: {summary}")
        sys.exit(0)
    except Exception as e:
        logger.critical(f"ETL script encountered a fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
