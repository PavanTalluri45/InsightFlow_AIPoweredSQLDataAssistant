from typing import Tuple, List, Dict, Any
import pandas as pd
from app.data_cleaning_pipeline.core.interfaces import DataValidator
from app.data_cleaning_pipeline.utils.logger import setup_logger

logger = setup_logger("retail_validator")

class RetailValidator(DataValidator):
    """
    Validates the Retail Sales dataset against structural and value constraints.
    """
    REQUIRED_COLUMNS = [
        "Transaction ID", "Date", "Customer ID", "Gender", 
        "Age", "Product Category", "Quantity", "Price per Unit", "Total Amount"
    ]

    def validate(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Validates raw Retail Sales data. Separates valid and invalid rows.
        
        Args:
            df (pd.DataFrame): Raw input DataFrame.
            
        Returns:
            Tuple[pd.DataFrame, pd.DataFrame]: (valid_rows, invalid_rows)
        """
        logger.info("Executing retail sales data validation...")
        
        # 1. Schema Validation
        missing_cols = [col for col in self.REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            error_msg = f"Schema Validation Error: Raw dataset is missing columns: {missing_cols}"
            logger.error(error_msg)
            raise ValueError(error_msg)

        # Initialize boolean series mapping row index to validity
        valid_mask = pd.Series(True, index=df.index)
        validation_failures: List[Dict[str, Any]] = []

        # 2. Check for missing/NaN values in any column
        for col in self.REQUIRED_COLUMNS:
            null_mask = df[col].isnull()
            if null_mask.any():
                fail_indices = df[null_mask].index
                valid_mask.loc[fail_indices] = False
                for idx in fail_indices:
                    tx_id = df.loc[idx, "Transaction ID"]
                    validation_failures.append({
                        "row": int(idx + 2),  # CSV file line (1-indexed header + 1-indexed record)
                        "transaction_id": tx_id if pd.notnull(tx_id) else "N/A",
                        "reason": f"Null/NaN value in column '{col}'"
                    })

        # Helper to retrieve transaction ID safely for logging
        def get_tx_id(row_idx: int) -> str:
            val = df.loc[row_idx, "Transaction ID"]
            return str(int(val)) if pd.notnull(val) and isinstance(val, (int, float)) else str(val)

        # 3. Check for duplicates in Transaction ID (Must be unique for Primary Key)
        # We flag any row that has a duplicate Transaction ID
        tx_col = "Transaction ID"
        duplicated_tx_mask = df.duplicated(subset=[tx_col], keep="first")
        if duplicated_tx_mask.any():
            fail_indices = df[duplicated_tx_mask].index
            valid_mask.loc[fail_indices] = False
            for idx in fail_indices:
                validation_failures.append({
                    "row": int(idx + 2),
                    "transaction_id": get_tx_id(idx),
                    "reason": f"Duplicate Transaction ID: {df.loc[idx, tx_col]}"
                })

        # 4. Check Value Range Constraints
        # Age validation (Sensible human age range e.g. 0 to 120)
        invalid_age_mask = ~df["Age"].between(0, 120)
        if invalid_age_mask.any():
            fail_indices = df[invalid_age_mask].index
            valid_mask.loc[fail_indices] = False
            for idx in fail_indices:
                validation_failures.append({
                    "row": int(idx + 2),
                    "transaction_id": get_tx_id(idx),
                    "reason": f"Age '{df.loc[idx, 'Age']}' is out of valid bounds (0-120)"
                })

        # Quantity validation (must be > 0)
        invalid_qty_mask = df["Quantity"] <= 0
        if invalid_qty_mask.any():
            fail_indices = df[invalid_qty_mask].index
            valid_mask.loc[fail_indices] = False
            for idx in fail_indices:
                validation_failures.append({
                    "row": int(idx + 2),
                    "transaction_id": get_tx_id(idx),
                    "reason": f"Quantity '{df.loc[idx, 'Quantity']}' must be greater than zero"
                })

        # Price per Unit validation (must be > 0)
        invalid_price_mask = df["Price per Unit"] <= 0
        if invalid_price_mask.any():
            fail_indices = df[invalid_price_mask].index
            valid_mask.loc[fail_indices] = False
            for idx in fail_indices:
                validation_failures.append({
                    "row": int(idx + 2),
                    "transaction_id": get_tx_id(idx),
                    "reason": f"Price per Unit '{df.loc[idx, 'Price per Unit']}' must be greater than zero"
                })

        # Total Amount validation (must be > 0)
        invalid_amount_mask = df["Total Amount"] <= 0
        if invalid_amount_mask.any():
            fail_indices = df[invalid_amount_mask].index
            valid_mask.loc[fail_indices] = False
            for idx in fail_indices:
                validation_failures.append({
                    "row": int(idx + 2),
                    "transaction_id": get_tx_id(idx),
                    "reason": f"Total Amount '{df.loc[idx, 'Total Amount']}' must be greater than zero"
                })

        # 5. Date Format validation (Format must be DD-MM-YYYY)
        parsed_dates = pd.to_datetime(df["Date"], format="%d-%m-%Y", errors="coerce")
        invalid_date_mask = parsed_dates.isnull()
        if invalid_date_mask.any():
            fail_indices = df[invalid_date_mask].index
            valid_mask.loc[fail_indices] = False
            for idx in fail_indices:
                validation_failures.append({
                    "row": int(idx + 2),
                    "transaction_id": get_tx_id(idx),
                    "reason": f"Date '{df.loc[idx, 'Date']}' does not match format DD-MM-YYYY"
                })

        # Separate the records
        valid_df = df[valid_mask].copy()
        invalid_df = df[~valid_mask].copy()

        logger.info(f"Validation Complete. Total Rows: {len(df)}, Valid: {len(valid_df)}, Invalid: {len(invalid_df)}")
        
        # Log validation failures
        if len(invalid_df) > 0:
            logger.warning(f"Found {len(invalid_df)} invalid rows during validation check:")
            for fail in validation_failures[:10]:  # Limit output in log
                logger.warning(f"  -> Line {fail['row']} (TxID: {fail['transaction_id']}): {fail['reason']}")
            if len(validation_failures) > 10:
                logger.warning(f"  -> ... and {len(validation_failures) - 10} more errors.")
                
        return valid_df, invalid_df
