from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from services.db import users_col
from config import Config

def register_routes(bp):
    @bp.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json(silent=True) or request.form or {}
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'user')
        if not username or not password:
            return jsonify({'success': False, 'message': 'username and password required'}), 400
        if users_col.find_one({'username': username}):
            return jsonify({'success': False, 'message': 'user exists'}), 400
        users_col.insert_one({'username': username, 'password': generate_password_hash(password), 'role': role})
        return jsonify({'success': True, 'message': 'user created'})

    @bp.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json(silent=True) or request.form or {}
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'success': False, 'message': 'username and password required'}), 400
        user = users_col.find_one({'username': username})
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'success': False, 'message': 'invalid credentials'}), 401
        user_role = user.get('role', 'user')
        access_payload = {
            'sub': username,
            'role': user_role,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(seconds=Config.ACCESS_TOKEN_EXPIRES)
        }
        refresh_payload = {
            'sub': username,
            'type': 'refresh',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(seconds=Config.REFRESH_TOKEN_EXPIRES)
        }
        access_token = jwt.encode(access_payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)
        refresh_token = jwt.encode(refresh_payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)
        return jsonify({'success': True, 'token': access_token, 'refresh': refresh_token, 'role': user_role})
