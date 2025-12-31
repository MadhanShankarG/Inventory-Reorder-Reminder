from flask import request, jsonify
from middleware.jwt_middleware import jwt_required
from utils.validators import api_error
from forecasting.service import calculate_forecast


def register_routes(bp):
    @bp.route('/api/forecast/<item_id>', methods=['GET'])
    @jwt_required(roles=['admin'])
    def get_forecast(item_id):
        try:
            days_back = int(request.args.get('days_back', 30))
            if days_back < 7 or days_back > 90:
                days_back = 30
        except (ValueError, TypeError):
            days_back = 30
        
        try:
            forecast = calculate_forecast(item_id, days_back)
            return jsonify({
                'success': True,
                'forecast': {
                    'item_id': forecast.item_id,
                    'item_name': forecast.item_name,
                    'current_quantity': forecast.current_quantity,
                    'threshold': forecast.threshold,
                    'average_daily_usage': forecast.average_daily_usage,
                    'days_until_depletion': forecast.days_until_depletion,
                    'estimated_depletion_date': forecast.estimated_depletion_date,
                    'suggested_reorder_quantity': forecast.suggested_reorder_quantity,
                    'reorder_urgency': forecast.reorder_urgency,
                    'confidence_score': forecast.confidence_score,
                    'calculation_period_days': forecast.calculation_period_days
                }
            })
        except ValueError as e:
            return api_error(str(e), 404)
        except Exception as e:
            return api_error('Failed to calculate forecast', 500)

