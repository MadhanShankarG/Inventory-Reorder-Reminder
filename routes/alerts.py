from flask import request, jsonify
from middleware.jwt_middleware import jwt_required
from services.alert_service import check_alerts


def register_routes(bp):
    @bp.route('/api/alerts/check', methods=['POST'])
    @jwt_required(roles=['admin'])
    def trigger_alerts_check():
        try:
            user = getattr(request, 'user', None)
            alerts_triggered = check_alerts(user=user)
            return jsonify({
                'success': True,
                'alerts_triggered': alerts_triggered
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Failed to check alerts',
                'alerts_triggered': 0
            }), 500

