from typing import Protocol, List, Tuple
import pandas as pd
from app.data_cleaning_pipeline.core.entities import SaleRecord

class DataReader(Protocol):
    """Interface for reading raw data from a source."""
    def read(self) -> pd.DataFrame:
        """
        Reads raw sales data.
        
        Returns:
            pd.DataFrame: The raw DataFrame containing sales data.
        """
        ...

class DataValidator(Protocol):
    """Interface for validating raw data rows and schemas."""
    def validate(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Validates the structure and content of raw data.
        
        Args:
            df (pd.DataFrame): Raw input DataFrame.
            
        Returns:
            Tuple[pd.DataFrame, pd.DataFrame]: 
                - First DataFrame contains valid rows that passed validation.
                - Second DataFrame contains invalid rows that failed validation.
        """
        ...

class DataTransformer(Protocol):
    """Interface for transforming validated raw data into domain entities."""
    def transform(self, df: pd.DataFrame) -> List[SaleRecord]:
        """
        Transforms validated DataFrame rows into list of SaleRecord domain entities.
        
        Args:
            df (pd.DataFrame): Validated input DataFrame.
            
        Returns:
            List[SaleRecord]: List of domain entities.
        """
        ...

class DataWriter(Protocol):
    """Interface for writing domain records to a destination database or store."""
    def write(self, records: List[SaleRecord]) -> int:
        """
        Writes domain records to the database.
        
        Args:
            records (List[SaleRecord]): List of SaleRecord domain objects to persist.
            
        Returns:
            int: The number of records successfully written to the store.
        """
        ...
