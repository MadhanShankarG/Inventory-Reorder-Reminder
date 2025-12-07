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
        if not username or not password:
            return jsonify({'success': False, 'message': 'username and password required'}), 400
        if users_col.find_one({'username': username}):
            return jsonify({'success': False, 'message': 'user exists'}), 400
        users_col.insert_one({'username': username, 'password': generate_password_hash(password)})
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
        payload = {
            'sub': username,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=8)
        }
        token = jwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)
        return jsonify({'success': True, 'token': token})
