from datetime import datetime

from flask import Blueprint, jsonify, request

from app.models.video import Video
from decorators import login_required
from models.embedded_document.comment import Comment
from models.enum.account_role import AccountRole
from models.user import User

video_bp = Blueprint('api_video', __name__)


@video_bp.route('/get', methods=['GET'])
def get_video():
    videos = [video.jsonify() for video in Video.get_random_videos(5)]
    return jsonify(videos), 200


@video_bp.route('/like', methods=['POST'])
@login_required(role=AccountRole.USER)
def like_video():
    data = request.get_json()
    video_id = data['videoId']
    user_id = data['userId']

    video = Video.objects(id=video_id).first()
    User.objects(id=user_id).first().update_one(push__like_videos=video)

    if video:
        video.update(inc__like_count=1)
        return jsonify({'message': 'Video liked successfully', 'like_count': video.like_count + 1})
    else:
        return jsonify({'message': 'Video not found'}), 404


# API thêm bình luận
@video_bp.route('/comment', methods=['POST'])
@login_required(role=AccountRole.USER)
def comment_video():
    data = request.get_json()
    video_id = data['videoID']
    content = data['comment']
    video = Video.objects(id=video_id).first()

    if video:
        new_comment = Comment(content=content, created_at=datetime.now())
        video.update(push__comments=new_comment)
        return jsonify({'message': 'Comment added successfully', 'comment_count': len(video.comments) + 1})
    else:
        return jsonify({'message': 'Video not found'}), 404
