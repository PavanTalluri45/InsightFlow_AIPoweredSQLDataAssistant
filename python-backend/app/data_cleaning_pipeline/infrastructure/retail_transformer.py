from datetime import datetime
from decimal import Decimal
from typing import List
import pandas as pd
from app.data_cleaning_pipeline.core.entities import SaleRecord
from app.data_cleaning_pipeline.core.interfaces import DataTransformer
from app.data_cleaning_pipeline.utils.logger import setup_logger

logger = setup_logger("retail_transformer")

class RetailTransformer(DataTransformer):
    """
    Transforms validated Retail Sales data into a list of clean domain SaleRecord objects,
    normalizing types, strings, and correcting financial calculations.
    """
    def transform(self, df: pd.DataFrame) -> List[SaleRecord]:
        """
        Transforms and normalizes a validated DataFrame into domain entities.
        
        Args:
            df (pd.DataFrame): Validated raw sales DataFrame.
            
        Returns:
            List[SaleRecord]: List of clean domain entity records.
        """
        logger.info("Executing retail sales data transformation...")
        records: List[SaleRecord] = []
        mismatch_count = 0

        # Convert DataFrame to a list of dicts for clean mapping without pandas indexing issues
        rows = df.to_dict(orient="records")

        for idx, row in enumerate(rows):
            try:
                tx_id = int(row["Transaction ID"])
                raw_date_str = str(row["Date"]).strip()
                cust_id = str(row["Customer ID"]).strip()
                
                # Standardize categorization strings (strip & title case)
                gender = str(row["Gender"]).strip().title()
                category = str(row["Product Category"]).strip().title()
                
                age = int(row["Age"])
                quantity = int(row["Quantity"])
                
                # Enforce Decimal types for precise financial operations
                price_per_unit = Decimal(str(row["Price per Unit"]))
                total_amount = Decimal(str(row["Total Amount"]))

                # Audit calculations: Total Amount = Quantity * Price
                expected_total = Decimal(quantity) * price_per_unit
                if total_amount != expected_total:
                    logger.warning(
                        f"Financial Mismatch: Transaction ID {tx_id} at row index {idx} "
                        f"has invalid Total Amount. Expected: {expected_total}, Found: {total_amount}. "
                        f"Recalculating and fixing."
                    )
                    total_amount = expected_total
                    mismatch_count += 1

                # Parse validated Date format DD-MM-YYYY into datetime.date object
                parsed_date = datetime.strptime(raw_date_str, "%d-%m-%Y").date()

                # Construct Domain Entity
                record = SaleRecord(
                    transaction_id=tx_id,
                    date=parsed_date,
                    customer_id=cust_id,
                    gender=gender,
                    age=age,
                    product_category=category,
                    quantity=quantity,
                    price_per_unit=price_per_unit,
                    total_amount=total_amount
                )
                records.append(record)

            except Exception as e:
                logger.error(
                    f"Transformation failure at row index {idx} (TxID: {row.get('Transaction ID')}): {str(e)}"
                )
                # In production ETL, raising or skipping is chosen.
                # Since validation passed, this exception represents a mapping/integrity issue.
                raise e

        logger.info(
            f"Transformation Complete: Normalised {len(records)} records. "
            f"Fixed {mismatch_count} total amount mismatches."
        )
        return records
