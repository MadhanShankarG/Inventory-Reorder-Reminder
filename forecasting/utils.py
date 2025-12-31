from datetime import datetime, timedelta
from typing import List, Dict, Optional
from services.db import logs_col, items_col
from bson.objectid import ObjectId


def get_quantity_changes(item_id: str, days_back: int = 30) -> List[Dict]:
    """Extract quantity changes from logs for a specific item."""
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)
    
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        return []
    
    query = {
        'details.id': item_id,
        'action': {'$in': ['create', 'update']},
        'time': {'$gte': cutoff_date}
    }
    
    cursor = logs_col.find(query).sort('time', 1)
    changes = []
    
    for log in cursor:
        details = log.get('details', {})
        changes_data = details.get('changes', {})
        
        if 'quantity' in changes_data:
            changes.append({
                'time': log.get('time'),
                'quantity': changes_data['quantity'],
                'action': log.get('action')
            })
        elif log.get('action') == 'create':
            item_doc = items_col.find_one({'_id': obj_id})
            if item_doc and 'quantity' in item_doc:
                changes.append({
                    'time': log.get('time'),
                    'quantity': item_doc['quantity'],
                    'action': 'create'
                })
    
    return changes


def calculate_usage_rate(changes: List[Dict], current_quantity: int) -> float:
    """Calculate average daily usage rate from quantity changes."""
    if not changes or len(changes) < 2:
        return 0.0
    
    sorted_changes = sorted(changes, key=lambda x: x['time'])
    
    total_days = 0
    total_usage = 0
    
    for i in range(1, len(sorted_changes)):
        prev_qty = sorted_changes[i-1].get('quantity', current_quantity)
        curr_qty = sorted_changes[i].get('quantity', current_quantity)
        
        if prev_qty > curr_qty:
            usage = prev_qty - curr_qty
            time_diff = sorted_changes[i]['time'] - sorted_changes[i-1]['time']
            days = max(time_diff.total_seconds() / 86400, 0.1)
            
            total_usage += usage
            total_days += days
    
    if total_days == 0:
        return 0.0
    
    return total_usage / total_days


def get_item_current_state(item_id: str) -> Optional[Dict]:
    """Get current item state from inventory."""
    try:
        obj_id = ObjectId(item_id)
        doc = items_col.find_one({'_id': obj_id})
        if not doc:
            return None
        doc['id'] = str(doc.pop('_id'))
        return doc
    except Exception:
        return None
