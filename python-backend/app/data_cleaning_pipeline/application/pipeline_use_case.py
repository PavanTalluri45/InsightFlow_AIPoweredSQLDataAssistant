from typing import Dict, Any, Optional
from pathlib import Path
from app.data_cleaning_pipeline.core.interfaces import DataReader, DataValidator, DataTransformer, DataWriter
from app.data_cleaning_pipeline.utils.logger import setup_logger

logger = setup_logger("pipeline_use_case")

class CleanSalesPipeline:
    """
    Coordinates and orchestrates the ETL data cleaning pipeline lifecycle.
    Depends entirely on abstractions (Protocols) rather than concrete classes.
    """
    def __init__(
        self,
        reader: DataReader,
        validator: DataValidator,
        transformer: DataTransformer,
        writer: DataWriter,
        invalid_records_output_path: Optional[Path] = None
    ) -> None:
        """
        Injects the pipeline interfaces.
        
        Args:
            reader (DataReader): Data extract implementation.
            validator (DataValidator): Data validation implementation.
            transformer (DataTransformer): Data transformation implementation.
            writer (DataWriter): Data load implementation.
            invalid_records_output_path (Optional[Path]): File path to output invalid records if found.
        """
        self.reader = reader
        self.validator = validator
        self.transformer = transformer
        self.writer = writer
        self.invalid_records_output_path = invalid_records_output_path

    def execute(self, dry_run: bool = False) -> Dict[str, Any]:
        """
        Executes the ETL pipeline: Extraction -> Validation -> Transformation -> Load.
        
        Args:
            dry_run (bool): If True, runs extraction, validation and transformation,
                            but skips database insertion.
                            
        Returns:
            Dict[str, Any]: Run statistics and execution status.
        """
        logger.info("Initializing Retail Sales ETL pipeline...")
        
        # 1. Extraction Phase
        try:
            raw_df = self.reader.read()
            total_raw = len(raw_df)
        except Exception as e:
            logger.critical(f"Extraction Phase Failed: {str(e)}")
            raise e

        # 2. Validation Phase
        try:
            valid_df, invalid_df = self.validator.validate(raw_df)
            total_valid = len(valid_df)
            total_invalid = len(invalid_df)
        except Exception as e:
            logger.critical(f"Validation Phase Failed: {str(e)}")
            raise e

        # Handle writing invalid files if output path is configured
        if total_invalid > 0 and self.invalid_records_output_path:
            try:
                self.invalid_records_output_path.parent.mkdir(parents=True, exist_ok=True)
                invalid_df.to_csv(self.invalid_records_output_path, index=False)
                logger.warning(
                    f"Saved {total_invalid} rejected records to audit file: {self.invalid_records_output_path}"
                )
            except Exception as e:
                logger.error(f"Failed to write rejected data to audit file: {str(e)}")

        if total_valid == 0:
            logger.error("Abort: Zero valid records found after validation.")
            return {
                "total_raw": total_raw,
                "total_valid": 0,
                "total_invalid": total_invalid,
                "total_written": 0,
                "status": "Aborted: No valid rows",
            }

        # 3. Transformation Phase
        try:
            domain_records = self.transformer.transform(valid_df)
        except Exception as e:
            logger.critical(f"Transformation Phase Failed: {str(e)}")
            raise e

        # 4. Load Phase
        total_written = 0
        if dry_run:
            logger.info("Dry Run mode active. Skipping PostgreSQL database insertion.")
            status = "Dry Run Success"
        else:
            try:
                total_written = self.writer.write(domain_records)
                status = "Success"
            except Exception as e:
                logger.critical(f"Load Phase Failed: {str(e)}")
                raise e

        # Return execution summary
        summary = {
            "total_raw": total_raw,
            "total_valid": total_valid,
            "total_invalid": total_invalid,
            "total_written": total_written,
            "status": status,
        }
        
        logger.info(f"ETL pipeline executed with status: {status}")
        logger.info(f"Run Summary Stats: {summary}")
        return summary
