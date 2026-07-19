from dataclasses import dataclass
from datetime import date
from decimal import Decimal

@dataclass(frozen=True)
class SaleRecord:
    """
    Represents a cleaned, validated, and normalized sales transaction record.
    This is the core domain entity.
    """
    transaction_id: int
    date: date
    customer_id: str
    gender: str
    age: int
    product_category: str
    quantity: int
    price_per_unit: Decimal
    total_amount: Decimal

    def __post_init__(self) -> None:
        """
        Validates post-initialization invariants for the entity.
        Ensures that core domain rules are respected.
        """
        if self.transaction_id <= 0:
            raise ValueError("Transaction ID must be positive")
        if self.age < 0 or self.age > 120:
            raise ValueError("Age must be a valid human age (0-120)")
        if self.quantity <= 0:
            raise ValueError("Quantity must be greater than zero")
        if self.price_per_unit <= 0:
            raise ValueError("Price per unit must be greater than zero")
        if self.total_amount <= 0:
            raise ValueError("Total amount must be greater than zero")
