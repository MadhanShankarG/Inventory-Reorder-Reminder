from datetime import datetime
from services.db import alerts_col
from services.reminder_service import get_low_stock_items
from services.log_service import log_action
from forecasting.service import calculate_forecast


def check_alerts(user=None):
    """
    Check for alerts based on low-stock items and forecasts.
    
    Args:
        user: User identifier for logging
    
    Returns:
        int: Number of alerts triggered
    """
    low_stock_items = get_low_stock_items()
    alerts_triggered = 0
    
    for item in low_stock_items:
        item_id = item.get('id')
        item_name = item.get('name', 'Unknown')
        current_quantity = item.get('quantity', 0)
        threshold = item.get('threshold', 0)
        
        alert_type = 'low_stock'
        severity = 'warning'
        message = f"{item_name} is running low. Current: {current_quantity}, Threshold: {threshold}"
        
        if current_quantity == 0:
            alert_type = 'out_of_stock'
            severity = 'critical'
            message = f"{item_name} is out of stock. Immediate reorder required."
        elif current_quantity <= threshold * 0.5:
            alert_type = 'urgent_low_stock'
            severity = 'critical'
            message = f"{item_name} is critically low. Current: {current_quantity}, Threshold: {threshold}"
        
        forecast_data = None
        try:
            forecast = calculate_forecast(item_id, days_back=30)
            forecast_data = {
                'days_until_depletion': forecast.days_until_depletion,
                'estimated_depletion_date': forecast.estimated_depletion_date,
                'suggested_reorder_quantity': forecast.suggested_reorder_quantity,
                'reorder_urgency': forecast.reorder_urgency,
                'confidence_score': forecast.confidence_score
            }
            
            if forecast.reorder_urgency == 'critical' or forecast.reorder_urgency == 'urgent':
                if severity != 'critical':
                    severity = 'high'
                    message += f" Forecast indicates depletion in {forecast.days_until_depletion} days."
        except Exception:
            pass
        
        alert_entry = {
            'item_id': item_id,
            'item_name': item_name,
            'alert_type': alert_type,
            'severity': severity,
            'message': message,
            'current_quantity': current_quantity,
            'threshold': threshold,
            'forecast': forecast_data,
            'created_at': datetime.utcnow(),
            'status': 'active',
            'acknowledged': False
        }
        
        try:
            alerts_col.insert_one(alert_entry)
            alerts_triggered += 1
            log_action(user, 'alert_created', item_name=item_name, details={
                'alert_type': alert_type,
                'severity': severity,
                'item_id': item_id
            })
        except Exception:
            pass
    
    if alerts_triggered > 0:
        log_action(user, 'alerts_check', item_name=None, details={
            'alerts_triggered': alerts_triggered,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    return alerts_triggered

