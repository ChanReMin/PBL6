import tempfile
from flask import Blueprint, jsonify, request, session
import cloudinary
import cloudinary.uploader
from app.models.video import Video
from app.models.music import Music

api_user_video_bp = Blueprint('api_user_video', __name__)
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
            response = cloudinary.uploader.upload_large(
                video_path, resource_type="video", format="mp4", public_id="uploaded_video"
            )
            video_url = response['url']
            # Save video details in the database
            video = Video(user=user_id, music=music.id, title=title, video_url=video_url).save()

            return jsonify({
                'id': str(video.id),
                'message': 'Video recorded and uploaded successfully',
                'url': video_url
            }), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type or file missing'}), 400
def generate_lyrics_overlay_filter(lyrics_data):
    """
    Generate FFmpeg filter string to overlay lyrics on the video at specific times.
    """
    filter_parts = []
    for lyric in lyrics_data:
        start_time = format_time(lyric['start_time'])
        end_time = format_time(lyric['end_time'])
        text = lyric['text']

        # Encode the text in UTF-8 and decode in 'latin-1' to pass it to FFmpeg safely
        safe_text = text.encode('utf-8').decode('latin-1')

        # Create FFmpeg filter for each lyric line, with formatted time and properly encoded text
        filter_parts.append(
            f"drawtext=text='{safe_text}':enable='between(t,{start_time},{end_time})':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-(2*lh)"
        )
    return ','.join(filter_parts)

def format_time(timestamp):
    """
    Format time to ensure it is in the format HH:MM:SS.MMM (milliseconds).
    """
    parts = timestamp.split(":")
    if len(parts) == 3:
        seconds = parts[2]
        if '.' not in seconds:
            # Add .000 for milliseconds if not present
            parts[2] += ".000"
        return ":".join(parts)
    return timestamp

@api_user_video_bp.route('/music_search', methods=['GET'])
def search_music():
    query = request.args.get('q', '').strip().lower()

    if not query:
        return jsonify({'music_options': []}), 200

    try:
        # Perform a case-insensitive search for music matching the query
        music_results = Music.objects(name__icontains=query).only('id', 'name', 'artists', 'lyrics', 'music_url')

        # If no results are found, return an empty list
        if not music_results:
            return jsonify({'music_options': []}), 200

        music_data = []
        for music in music_results:
            # Resolve LazyReferenceField (artists) to actual objects
            artists_resolved = [artist.fetch() for artist in music.artists]  # Fetch the actual artist objects

            # Prepare the serialized artist data (e.g., id and name)
            artists_data = [{'id': str(artist.id), 'name': artist.name} for artist in artists_resolved]

            # Convert the lyrics to a serializable format (dictionary)
            lyrics_data = [{
                'order': lyric.order,
                'text': lyric.text,
                'start_time': lyric.start_time,
                'end_time': lyric.end_time,
                'artist_index': lyric.artist_index,
                'vector': lyric.vector  # Ensure this is also serializable, or convert it as needed
            } for lyric in music.lyrics]

            # Prepare the final data for each music item, including lyrics
            music_data.append({
                'id': str(music.id),
                'name': music.name,
                'artists': artists_data,  # Add resolved artist data
                'lyrics': lyrics_data,  # Add serialized lyrics data
                'music_url': music.music_url  # Include the music URL
            })

        return jsonify({'music_options': music_data}), 200

    except Exception as e:
        # Catch any other error that occurs and return a 500 response
        return jsonify({'error': str(e)}), 500
