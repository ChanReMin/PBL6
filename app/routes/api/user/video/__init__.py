import tempfile

import cloudinary
import cloudinary.uploader
from flask import Blueprint, jsonify, request, session

from app.models.music import Music
from app.models.video import Video
from app.routes.api.user.video.comment import api_user_video_comment_bp

api_user_video_bp = Blueprint('api_user_video', __name__)
api_user_video_bp.register_blueprint(api_user_video_comment_bp, url_prefix='/comment')

ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'webm'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@api_user_video_bp.route('/record', methods=['POST'])
def record_video():
    user_id = session.get('user').get('id')
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    video_file = request.files['video']
    if video_file and allowed_file(video_file.filename):
        # Get title and other details from the form
        title = request.form.get('title')
        if not title:
            return jsonify({'error': 'Title is required'}), 400

        music_id = request.form.get('music_id')
        if not music_id:
            return jsonify({'error': 'Music selection is required'}), 400

        music_start = request.form.get('music_start')
        if not music_start:
            music_start = 0

        music_end = request.form.get('music_end')
        if not music_end:
            music_end = 0
        try:
            # Fetch the music object
            music = Music.objects(id=music_id).first()
            if not music:
                return jsonify({'error': 'Invalid music selection'}), 404

            # Use tempfile to create a temporary file for the uploaded video
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_video:
                video_path = temp_video.name
                video_file.save(video_path)  # Save the uploaded video to the temp file

            # Upload the video to Cloudinary directly from the saved file
            response = cloudinary.uploader.upload_large(video_path, resource_type="video", format="mp4")
            video_url = response['url']
            # Save video details in the database
            video = Video(user=user_id, music=music.id, title=title, video_url=video_url, music_start=music_start, music_end=music_end).save()

            return jsonify({
                'id': str(video.id),
                'message': 'Video recorded and uploaded successfully',
                'url': video_url
            }), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type or file missing'}), 400

@api_user_video_bp.route('/get', methods=['POST'])
def get_video():
    data = request.get_json()
    user_id = data['userId']
    # Load user object
    from app.models.base.extended_account import ExtendedAccount
    user = ExtendedAccount.objects(id=user_id).first()

    # Lấy video + cặp (video, liked_video)
    video_tuples = Video.objects.get_random_videos(5, user_id=user_id)
    videos = []
    for video, liked in video_tuples:
        # Gọi video.jsonify(current_user=user) để comment.jsonify() có current_user
        video_json = video.jsonify(current_user=user)
        # Thêm trường 'liked' cho video
        video_json['liked'] = liked
        videos.append(video_json)

    return jsonify(videos), 200


@api_user_video_bp.route('/like', methods=['POST'])
def like_video():
    data = request.get_json()
    video_id = data['videoId']
    user_id = data['userId']

    video_like_count = Video.objects.like_video(video_id=video_id, user_id=user_id)
    if video_like_count == -1:
        return jsonify({'success': False})
    return jsonify({'success': True, 'like_count': video_like_count})


@api_user_video_bp.route('/unlike', methods=['POST'])
def unlike_video():
    data = request.get_json()
    video_id = data['videoId']
    user_id = data['userId']

    video_like_count = Video.objects.unlike_video(video_id=video_id, user_id=user_id)
    if video_like_count == -1:
        return jsonify({'success': False})
    return jsonify({'success': True, 'like_count': video_like_count})

@api_user_video_bp.route('/public', methods=['POST'])
def set_public_video():
    data = request.get_json()
    video_id = data['video_id']
    public_state = data['public_state']
    Video.objects(id=video_id).update_one(set__public=public_state)
    return jsonify({'success': True})

@api_user_video_bp.route('/update', methods=['PUT'])
def update_video():
    data = request.form
    thumbnail = request.files.get('thumbnail')
    video_id = data['video_id']
    video = Video.objects(id=video_id).first()

    if data.get('title'):
        video.title = data['title']
    if thumbnail:
        public_id = f"thumbnails_{video_id}"
        try:
            response = cloudinary.uploader.upload(
                thumbnail,
                resource_type="image",
                public_id=public_id,
                overwrite=True,
                transformation=[
                    {
                        'width': 212,
                        'height': 212,
                        'crop': 'fill',
                        'gravity': 'face',
                        'quality': 'auto',
                        'fetch_format': 'auto'
                    }
                ]
            )
            video.thumbnail_url = response['secure_url']
        except Exception as e:
            return jsonify({'Error': e})
    video.save()
    return jsonify({'Success': True})