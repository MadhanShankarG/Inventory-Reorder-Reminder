from flask import request, jsonify
from services.db import items_col, reminders_col, logs_col
from utils.validators import validate_item_payload, api_error
from bson.objectid import ObjectId
from datetime import datetime
from config import Config
import jwt

def jwt_required(fn):
    def wrapper(*args, **kwargs):
        from flask import request
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return api_error('Authorization header missing', 401)
        token = auth.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
            request.user = payload['sub']
        except Exception:
            return api_error('Invalid token', 401)
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

def register_routes(bp):
    @bp.route('/api/items', methods=['GET'])
    @jwt_required
    def list_items():
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 100))
        skip = (page - 1) * per_page
        cursor = items_col.find().skip(skip).limit(per_page)
        items = []
        for it in cursor:
            it['id'] = str(it.pop('_id'))
            items.append(it)
        return jsonify({'success': True, 'items': items})

    @bp.route('/api/items', methods=['POST'])
    @jwt_required
    def add_item():
        data = request.json or {}
        ok, payload = validate_item_payload(data)
        if not ok:
            return api_error(payload, 400)
        payload['created_at'] = datetime.utcnow()
        res = items_col.insert_one(payload)
        logs_col.insert_one({'action': 'create', 'item_id': str(res.inserted_id), 'user': getattr(request, 'user', None), 'time': datetime.utcnow()})
        return jsonify({'success': True, 'id': str(res.inserted_id)})

    @bp.route('/api/items/<item_id>', methods=['PUT'])
    @jwt_required
    def update_item(item_id):
        data = request.json or {}
        update = {}
        for k in ['name', 'sku', 'quantity', 'threshold']:
            if k in data:
                update[k] = int(data[k]) if k in ['quantity', 'threshold'] else data[k]
        if not update:
            return api_error('no fields to update', 400)
        res = items_col.update_one({'_id': ObjectId(item_id)}, {'$set': update})
        if res.matched_count == 0:
            return api_error('item not found', 404)
        logs_col.insert_one({'action': 'update', 'item_id': item_id, 'user': getattr(request, 'user', None), 'time': datetime.utcnow()})
        return jsonify({'success': True})

    @bp.route('/api/items/<item_id>', methods=['DELETE'])
    @jwt_required
    def delete_item(item_id):
        res = items_col.delete_one({'_id': ObjectId(item_id)})
        if res.deleted_count == 0:
            return api_error('item not found', 404)
        logs_col.insert_one({'action': 'delete', 'item_id': item_id, 'user': getattr(request, 'user', None), 'time': datetime.utcnow()})
        return jsonify({'success': True})

    @bp.route('/api/summary', methods=['GET'])
    @jwt_required
    def summary():
        total = items_col.count_documents({})
        low_stock = items_col.count_documents({'$expr': {'$lte': ['$quantity', '$threshold']}})
        out_of_stock = items_col.count_documents({'quantity': 0})
        return jsonify({
            'success': True,
            'total_items': total,
            'low_stock_count': low_stock,
            'out_of_stock_count': out_of_stock
        })

    @bp.route('/api/reminders', methods=['GET'])
    @jwt_required
    def reminders():
        cursor = items_col.find({'$expr': {'$lte': ['$quantity', '$threshold']}})
        out = []
        for it in cursor:
            it['id'] = str(it.pop('_id'))
            out.append(it)
        return jsonify({'success': True, 'reminders': out})
