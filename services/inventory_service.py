from datetime import datetime
from bson.objectid import ObjectId
from services.db import items_col
from services.log_service import log_action


def get_all_items():
    cursor = items_col.find()
    out = []
    for it in cursor:
        it['id'] = str(it.pop('_id'))
        out.append(it)
    return out


def get_item(id):
    try:
        doc = items_col.find_one({'_id': ObjectId(id)})
    except Exception:
        return None
    if not doc:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


def create_item(data, user=None):
    data = dict(data)
    data['created_at'] = datetime.utcnow()
    data['last_updated'] = datetime.utcnow()
    res = items_col.insert_one(data)
    inserted_id = str(res.inserted_id)
    log_action(user, 'create', item_name=data.get('name'), details={'id': inserted_id})
    return inserted_id


def update_item(id, data, user=None):
    update = dict(data)
    update['last_updated'] = datetime.utcnow()
    try:
        res = items_col.update_one({'_id': ObjectId(id)}, {'$set': update})
    except Exception:
        return False
    if res.matched_count == 0:
        return False
    item = get_item(id)
    item_name = item.get('name') if item else update.get('name')
    log_action(user, 'update', item_name=item_name, details={'id': id, 'changes': update})
    return True


def delete_item(id, user=None):
    try:
        doc = items_col.find_one({'_id': ObjectId(id)})
        name = doc.get('name') if doc else None
    except Exception:
        name = None
    try:
        res = items_col.delete_one({'_id': ObjectId(id)})
    except Exception:
        return False
    if res.deleted_count == 0:
        return False
    log_action(user, 'delete', item_name=name, details={'id': id})
    return True
