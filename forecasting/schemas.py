from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class ForecastResult:
    item_id: str
    item_name: str
    current_quantity: int
    threshold: int
    average_daily_usage: float
    days_until_depletion: Optional[int]
    estimated_depletion_date: Optional[str]
    suggested_reorder_quantity: int
    reorder_urgency: str
    confidence_score: float
    calculation_period_days: int

