from services.db import items_col, logs_col


def get_total_items():
    return items_col.count_documents({})


def get_low_stock_count():
    return items_col.count_documents({'$expr': {'$lte': ['$quantity', '$threshold']}})


def get_out_of_stock_count():
    return items_col.count_documents({'quantity': 0})


def get_category_breakdown():
    pipeline = [
        {'$group': {'_id': '$category', 'count': {'$sum': 1}, 'total_quantity': {'$sum': '$quantity'}}},
        {'$project': {'category': '$_id', 'count': 1, 'total_quantity': 1, '_id': 0}}
    ]
    return list(items_col.aggregate(pipeline))


def get_stock_value():
    pipeline = [
        {'$project': {'value': {'$multiply': ['$quantity', {'$ifNull': ['$unit_price', 0]}]}}},
        {'$group': {'_id': None, 'total_value': {'$sum': '$value'}}}
    ]
    res = list(items_col.aggregate(pipeline))
    return res[0]['total_value'] if res else 0


def get_recent_activity(limit=10):
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


def get_summary():
    total = get_total_items()
    low = get_low_stock_count()
    out_of = get_out_of_stock_count()
    cat = get_category_breakdown()
    stock_value = get_stock_value()
    recent = get_recent_activity(10)
    return {
        'success': True,
        'total_items': total,
        'low_stock_count': low,
        'out_of_stock_count': out_of,
        'category_breakdown': cat,
        'stock_value': stock_value,
        'recent_activity': recent
    }
