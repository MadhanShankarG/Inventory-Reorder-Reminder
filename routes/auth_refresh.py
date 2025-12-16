from flask import request, jsonify
from datetime import datetime, timedelta
from services.db import users_col
from config import Config
import jwt

def register_routes(bp):
    @bp.route('/api/refresh', methods=['POST'])
    def refresh():
        data = request.get_json(silent=True) or {}
        refresh_token = data.get('refresh')
        if not refresh_token:
            return jsonify({'success': False, 'message': 'refresh token required'}), 400
        try:
            payload = jwt.decode(refresh_token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
            if payload.get('type') != 'refresh':
                return jsonify({'success': False, 'message': 'invalid token type'}), 401
            username = payload.get('sub')
            user = users_col.find_one({'username': username})
            if not user:
                return jsonify({'success': False, 'message': 'user not found'}), 401
            user_role = user.get('role', 'user')
            access_payload = {
                'sub': username,
                'role': user_role,
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(seconds=Config.ACCESS_TOKEN_EXPIRES)
            }
            access_token = jwt.encode(access_payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)
            return jsonify({'success': True, 'token': access_token})
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'refresh token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'invalid refresh token'}), 401

