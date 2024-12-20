from flask import Blueprint, render_template, session
from flask_wtf.csrf import generate_csrf

from app.routes.user.profile import user_profile_bp
from app.routes.user.setting import user_setting_bp
from app.routes.user.video import user_video_bp
from app.routes.forms.login_form import LoginForm
from app.routes.forms.register_form import RegisterForm

user_bp = Blueprint('user', __name__)
user_bp.register_blueprint(user_video_bp, url_prefix='/video')
user_bp.register_blueprint(user_profile_bp, url_prefix='/profile')
user_bp.register_blueprint(user_setting_bp, url_prefix='/setting')

@user_bp.route('/index')
def index():
    user = session.get('user')
    if user:
        return render_template('user/index.html', user=user)

    login_form = LoginForm(meta={'csrf_context': 'login'})
    register_form = RegisterForm(meta={'csrf_context': 'register'})

    register_csrf_token = generate_csrf(token_key='register_token')
    login_csrf_token = generate_csrf(token_key='login_token')
    login_form.csrf_token.data = login_csrf_token
    register_form.csrf_token.data = register_csrf_token

    return render_template('user/index.html', login_form=login_form, register_form=register_form)
