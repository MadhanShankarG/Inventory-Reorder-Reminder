from flask import jsonify

def validate_item_payload(data):
    required = ['name', 'sku', 'quantity', 'threshold']
    missing = [f for f in required if f not in data]
    if missing:
        return False, {'error': 'missing_fields', 'missing': missing}
    # simple types
    try:
        data['quantity'] = int(data['quantity'])
        data['threshold'] = int(data['threshold'])
    except Exception:
        return False, {'error': 'invalid_types', 'message': 'quantity and threshold must be integers'}
    return True, data

def api_error(message, code=400):
    if isinstance(message, dict):
        return jsonify({'success': False, **message}), code
    return jsonify({'success': False, 'message': message}), code
