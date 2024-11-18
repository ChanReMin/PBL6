from flask import Blueprint
from app.routes.api.admin import api_admin_bp
from app.routes.api.auth import api_auth_bp
from app.routes.api.video import video_bp
from app.routes.api.user import api_user_bp

api_bp = Blueprint('api', __name__)
api_bp.register_blueprint(api_admin_bp, url_prefix='/admin')
api_bp.register_blueprint(video_bp, url_prefix='/video')
api_bp.register_blueprint(api_auth_bp, url_prefix='/auth')
api_bp.register_blueprint(api_user_bp, url_prefix='/user')