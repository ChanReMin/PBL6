from flask import Blueprint, render_template, request, session

from decorators import login_required
from app.models.base.extended_account import ExtendedAccount
from app.models.enum.account_role import AccountRole
from app.models.follow import Follow

user_profile_bp = Blueprint('profile', __name__)

@user_profile_bp.route('/home/<string:user_id>', methods=['GET'])
@login_required(role=[AccountRole.USER, AccountRole.ARTIST])
def get_profile(user_id):
    flag = 'home'
    user = ExtendedAccount.objects(id=user_id).first()
    follower_id = session['user']['id']
    follow_status = Follow.objects.get_follow_status(follower_id=follower_id, following_id=user_id)
    return render_template('user/profile/home.html',
                           user=user,
                           follow_status=follow_status,
                           flag=flag)
