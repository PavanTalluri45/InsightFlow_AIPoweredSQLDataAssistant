from pathlib import Path
import pandas as pd
from app.data_cleaning_pipeline.core.interfaces import DataReader
from app.data_cleaning_pipeline.utils.logger import setup_logger

logger = setup_logger("pandas_reader")

class PandasDataReader(DataReader):
    """
    Implements the DataReader interface using pandas to load CSV data.
    """
    def __init__(self, file_path: Path) -> None:
        """
        Initializes the CSV reader with the target file path.
        
        Args:
            file_path (Path): Path to the source CSV file.
        """
        self.file_path = Path(file_path)

    def read(self) -> pd.DataFrame:
        """
        Reads raw sales data from the configured CSV file.
        
        Returns:
            pd.DataFrame: Raw Pandas DataFrame loaded from CSV.
            
        Raises:
            FileNotFoundError: If the source CSV file does not exist.
        """
        logger.info(f"Reading raw CSV dataset from: {self.file_path}")
        
        if not self.file_path.exists():
            error_msg = f"Source CSV file not found at: {self.file_path.absolute()}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)
            
        try:
            # Load raw data from CSV (leaving it completely unmodified)
            df = pd.read_csv(self.file_path)
            logger.info(f"Loaded {len(df)} records from CSV.")
            return df
        except Exception as e:
            logger.error(f"Error occurred while reading the CSV: {str(e)}")
            raise e
