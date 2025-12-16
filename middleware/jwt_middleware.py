from flask import request, jsonify
from config import Config
import jwt
from functools import wraps

def jwt_required(roles=None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth = request.headers.get('Authorization', '')
            if not auth.startswith('Bearer '):
                return jsonify({'success': False, 'message': 'Authorization header missing'}), 401
            token = auth.split(' ', 1)[1]
            try:
                payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
                request.user = payload.get('sub')
                request.user_role = payload.get('role', 'user')
                if roles and request.user_role not in roles:
                    return jsonify({'success': False, 'message': 'Insufficient permissions'}), 403
            except jwt.ExpiredSignatureError:
                return jsonify({'success': False, 'message': 'Token expired'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'success': False, 'message': 'Invalid token'}), 401
            return fn(*args, **kwargs)
        wrapper.__name__ = fn.__name__
        return wrapper
    return decorator

