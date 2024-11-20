from flask import Blueprint
from app.routes.api.user.video import api_user_video_bp
from app.routes.api.user.profile import api_user_profile_bp
from app.routes.api.user.follow import api_user_follow_bp

api_user_bp = Blueprint('api_user', __name__)
api_user_bp.register_blueprint(api_user_video_bp, url_prefix='/video')
api_user_bp.register_blueprint(api_user_profile_bp, url_prefix='/profile')
api_user_bp.register_blueprint(api_user_follow_bp, url_prefix='/follow')

