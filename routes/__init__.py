from flask import Blueprint

api_bp = Blueprint("api", __name__)

from .auth import register_routes as register_auth_routes
from .auth_refresh import register_routes as register_auth_refresh_routes
from .items import register_routes as register_items_routes

register_auth_routes(api_bp)
register_auth_refresh_routes(api_bp)
register_items_routes(api_bp)
