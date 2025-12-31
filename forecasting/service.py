from datetime import datetime, timedelta
from typing import Optional
from forecasting.schemas import ForecastResult
from forecasting.utils import get_quantity_changes, calculate_usage_rate, get_item_current_state


def calculate_forecast(item_id: str, days_back: int = 30) -> ForecastResult:
    """
    Calculate forecast for an item using simple math.
    
    Args:
        item_id: MongoDB ObjectId string of the item
        days_back: Number of days to look back for usage data
    
    Returns:
        ForecastResult with forecast data
    """
    item = get_item_current_state(item_id)
    
    if not item:
        raise ValueError(f"Item {item_id} not found")
    
    current_quantity = item.get('quantity', 0)
    threshold = item.get('threshold', 0)
    item_name = item.get('name', 'Unknown')
    
    changes = get_quantity_changes(item_id, days_back)
    avg_daily_usage = calculate_usage_rate(changes, current_quantity)
    
    days_until_depletion = None
    estimated_depletion_date = None
    
    if avg_daily_usage > 0:
        days_until_depletion = int(current_quantity / avg_daily_usage)
        depletion_date = datetime.utcnow() + timedelta(days=days_until_depletion)
        estimated_depletion_date = depletion_date.isoformat()
    elif current_quantity == 0:
        days_until_depletion = 0
        estimated_depletion_date = datetime.utcnow().isoformat()
    
    suggested_reorder_quantity = max(threshold * 2, threshold + int(avg_daily_usage * 7))
    
    if current_quantity <= threshold:
        reorder_urgency = 'critical'
    elif days_until_depletion and days_until_depletion <= 7:
        reorder_urgency = 'urgent'
    elif days_until_depletion and days_until_depletion <= 14:
        reorder_urgency = 'moderate'
    else:
        reorder_urgency = 'low'
    
    data_points = len(changes)
    if data_points >= 10:
        confidence_score = 0.85
    elif data_points >= 5:
        confidence_score = 0.65
    elif data_points >= 2:
        confidence_score = 0.45
    else:
        confidence_score = 0.25
    
    return ForecastResult(
        item_id=item_id,
        item_name=item_name,
        current_quantity=current_quantity,
        threshold=threshold,
        average_daily_usage=round(avg_daily_usage, 2),
        days_until_depletion=days_until_depletion,
        estimated_depletion_date=estimated_depletion_date,
        suggested_reorder_quantity=suggested_reorder_quantity,
        reorder_urgency=reorder_urgency,
        confidence_score=round(confidence_score, 2),
        calculation_period_days=days_back
    )

