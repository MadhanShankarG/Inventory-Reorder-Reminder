from flask import request, jsonify
from utils.validators import validate_item_payload, api_error
from middleware.jwt_middleware import jwt_required
from services import inventory_service, analytics_service, reminder_service


def register_routes(bp):
    @bp.route('/api/items', methods=['GET'])
    @jwt_required()
    def list_items():
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 100))
        skip = (page - 1) * per_page
        all_items = inventory_service.get_all_items()
        items = all_items[skip: skip + per_page]
        return jsonify({'success': True, 'items': items})

    @bp.route('/api/items', methods=['POST'])
    @jwt_required(roles=['admin'])
    def add_item():
        data = request.json or {}
        ok, payload = validate_item_payload(data)
        if not ok:
            return api_error(payload, 400)
        try:
            new_id = inventory_service.create_item(payload, user=getattr(request, 'user', None))
            return jsonify({'success': True, 'id': new_id})
        except Exception as e:
            return api_error('failed to create item', 500)

    @bp.route('/api/items/<item_id>', methods=['PUT'])
    @jwt_required(roles=['admin'])
    def update_item(item_id):
        data = request.json or {}
        update = {}
        for k in ['name', 'sku', 'quantity', 'threshold']:
            if k in data:
                update[k] = int(data[k]) if k in ['quantity', 'threshold'] else data[k]
        if not update:
            return api_error('no fields to update', 400)
        ok = inventory_service.update_item(item_id, update, user=getattr(request, 'user', None))
        if not ok:
            return api_error('item not found', 404)
        return jsonify({'success': True})

    @bp.route('/api/items/<item_id>', methods=['DELETE'])
    @jwt_required(roles=['admin'])
    def delete_item(item_id):
        ok = inventory_service.delete_item(item_id, user=getattr(request, 'user', None))
        if not ok:
            return api_error('item not found', 404)
        return jsonify({'success': True})

    @bp.route('/api/summary', methods=['GET'])
    @jwt_required()
    def summary():
        summary = analytics_service.get_summary()
        return jsonify(summary)

    @bp.route('/api/reminders', methods=['GET'])
    @jwt_required()
    def reminders():
        items = reminder_service.get_low_stock_items()
        return jsonify({'success': True, 'reminders': items})
