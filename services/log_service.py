from datetime import datetime
from services.db import logs_col


def log_action(user, action, item_name=None, details=None):
    entry = {
        'user': user,
        'action': action,
        'item_name': item_name,
        'details': details or {},
        'time': datetime.utcnow()
    }
    try:
        logs_col.insert_one(entry)
    except Exception:
        pass


def get_recent_logs(limit=10):
    cursor = logs_col.find().sort('time', -1).limit(limit)
    out = []
    for l in cursor:
        out.append({
            'user': l.get('user'),
            'action': l.get('action'),
            'item_name': l.get('item_name'),
            'details': l.get('details'),
            'time': l.get('time').isoformat() if l.get('time') else None
        })
    return out
