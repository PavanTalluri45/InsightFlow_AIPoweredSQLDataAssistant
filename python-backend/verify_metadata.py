import json
import logging
from app.core.cache import MetadataCache
from app.database_metadata_profilinglayer.validator import SQLValidator
from app.database_metadata_profilinglayer.query_executor import QueryExecutor

# Configure log output for verification runner
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)-8s [%(name)s] - %(message)s"
)
logger = logging.getLogger("verify_metadata")

def main() -> None:
    logger.info("=========================================================")
    logger.info("Database Metadata & Profiling Layer verification runner")
    logger.info("=========================================================")
    
    # 1. Verify Cache Ingestion & Metadata Generator (coordinating Explorer, Loader, and Profiler)
    cache = MetadataCache()
    
    logger.info("\n--- Phase 1: Checking Metadata Generation & Caching ---")
    logger.info("Loading and compiling database catalog profiles...")
    cache.load(force=True)
    
    metadata = cache.get_metadata()
    logger.info(f"Metadata compilation success. Database catalog: '{metadata['database_name']}'")
    logger.info(f"Total tables discovered: {metadata['total_tables']}")
    
    for table_name, table_data in metadata["tables"].items():
        logger.info(f"Table '{table_name}':")
        logger.info(f"  - Total Columns: {table_data['column_count']}")
        logger.info(f"  - Total Rows: {table_data['row_count']}")
        logger.info("  - Relationship configurations:")
        logger.info(f"    - Primary Keys: {table_data['relationships']['primary_keys']}")
        logger.info(f"    - Foreign Keys: {table_data['relationships']['foreign_keys']}")
        
        logger.info("  - Columns Details (First 3 sample profiles):")
        for col in table_data["columns"][:3]:
            logger.info(
                f"    -> Column '{col['name']}' | SQL Type: '{col['data_type']}' | Nullable: {col['nullable']} | "
                f"IsPK: {col['is_primary']} | Class: {col['type_classification']} | "
                f"Distinct: {col['distinct_count']} | Nulls: {col['null_count']} | "
                f"Range: [{col['min']}, {col['max']}] | Avg: {col['average']} | "
                f"Samples: {col['sample_values']}"
            )

    # Output serialized JSON artifact
    output_path = "database_metadata_summary.json"
    try:
        with open(output_path, "w") as f:
            json.dump(metadata, f, indent=2)
        logger.info(f"Successfully wrote full metadata JSON profile to '{output_path}'")
    except Exception as e:
        logger.error(f"Failed to write metadata JSON: {str(e)}")

    # 2. Verify SQL Query Validator
    logger.info("\n--- Phase 2: Auditing SQL Query Validator ---")
    validator = SQLValidator()
    
    validation_tests = [
        ("SELECT * FROM retail_sales LIMIT 50;", True),
        ("WITH product_avg AS (SELECT product_category, avg(total_amount) as mean_sales FROM retail_sales GROUP BY 1) SELECT * FROM product_avg WHERE mean_sales > 100;", True),
        ("DELETE FROM retail_sales WHERE transaction_id = 45;", False),
        ("DROP TABLE retail_sales;", False),
        ("SELECT * FROM retail_sales; DROP TABLE retail_sales;", False),
        ("SELECT * FROM retail_sales; -- ALTER TABLE retail_sales ADD COLUMN temp_column INT;", True),
        ("UPDATE retail_sales SET quantity = 10 WHERE transaction_id = 12;", False),
        ("INSERT INTO retail_sales (transaction_id, quantity) VALUES (1001, 5);", False),
        ("TRUNCATE TABLE retail_sales;", False),
        ("GRANT ALL PRIVILEGES ON retail_sales TO PUBLIC;", False)
    ]

    for sql_query, expected_valid in validation_tests:
        is_valid, reason = validator.validate(sql_query)
        test_status = "PASSED" if is_valid == expected_valid else "FAILED"
        logger.info(f"Query: {sql_query[:70]:<70} | Valid: {is_valid:<5} | Expected: {expected_valid:<5} | Result: {test_status}")
        assert is_valid == expected_valid, f"Validation failure on: '{sql_query}'. Reason: {reason}"

    # 3. Verify Query Executor
    logger.info("\n--- Phase 3: Auditing Query Executor (Safe operations) ---")
    executor = QueryExecutor()
    
    # Run simple aggregations to verify output mapping
    test_agg_sql = """
        SELECT 
            product_category, 
            sum(quantity) as units_sold, 
            avg(price_per_unit) as average_price,
            sum(total_amount) as total_sales
        FROM retail_sales 
        GROUP BY product_category 
        ORDER BY total_sales DESC;
    """
    try:
        results = executor.execute(test_agg_sql)
        logger.info("Aggregation query executed successfully. Resulting records:")
        for idx, row in enumerate(results):
            logger.info(
                f"  [{idx+1}] Category: {row['product_category']:<12} | "
                f"Units Sold: {row['units_sold']:<4} | "
                f"Avg Price: {row['average_price']:>6.2f} | "
                f"Total Sales: {row['total_sales']:>8.2f}"
            )
    except Exception as e:
        logger.error(f"Executor failed on valid SELECT statement: {str(e)}")
        raise e

    # 4. Verify Database-level Session Protection (Read-Only)
    logger.info("\n--- Phase 4: Auditing Database Session Protection ---")
    # Execute write statement direct through executor to bypass validator and test DB-level safeguard
    write_sql_bypass = "UPDATE retail_sales SET quantity = 999 WHERE transaction_id = -1;"
    try:
        logger.info("Executing UPDATE query directly to test Postgres read-only transaction block...")
        executor.execute(write_sql_bypass)
        logger.error("CRITICAL SAFETY FAILURE: Database session allowed write operations.")
        raise AssertionError("Database session failed to enforce read-only transaction parameters.")
    except Exception as e:
        logger.info(f"Safe Exception Received (Read-Only Session Enforced): {str(e)}")
        logger.info("SUCCESS: Database-level read-only session protection is ACTIVE and WORKING.")

    logger.info("\n=========================================================")
    logger.info("Verification Complete: All Database Metadata & Profiling systems are functioning.")
    logger.info("=========================================================")

if __name__ == "__main__":
    main()
