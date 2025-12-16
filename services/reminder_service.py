from services.db import items_col


def get_low_stock_items():
    cursor = items_col.find({'$expr': {'$lte': ['$quantity', '$threshold']}})
    out = []
    for it in cursor:
        it['id'] = str(it.pop('_id'))
        out.append(it)
    return out


def get_urgent_items():
    cursor = items_col.find({'$expr': {'$lte': ['$quantity', {'$multiply': ['$threshold', 0.5]}]}})
    out = []
    for it in cursor:
        it['id'] = str(it.pop('_id'))
        out.append(it)
    return out
