from bson import ObjectId
from flask import Blueprint, jsonify, request, session
import cloudinary
import cloudinary.uploader
from app.models.music import Music
from utils import embedding
api_artist_music_bp = Blueprint('api_artist_music', __name__)

@api_artist_music_bp.route('/', methods=['PUT'])
def update_music():
    data = request.get_json()
    music = Music.objects.get(id=data['id'])
    if data.get('name'):
        music.name = data['name']
    if data.get('artists'):
        music.artists = data['artists']
    if data.get('genres'):
        music.genres = data['genres']
    if data.get('music_url'):
        music.music_url = data['music_url']
    if data.get('lyrics'):
        music.lyrics = data['lyrics']

    embedded_title = embedding.encode_sentences(music.name)
    music.name_embedded = embedded_title.tolist()

    music.save()

    return jsonify({'message': 'Music updated successfully'}), 200

@api_artist_music_bp.route('/search_music', methods=['GET'])
def search_music():
    data = request.get_json()
    query = data['name']
    embedded_query = embedding.encode_sentences(query)
    results = []
    all_music = Music.objects.all()
    print(all_music)
    for music in all_music:
        cosine_similarity = embedding.cosine_similarity(embedded_query, music.name_embedded)
        results.append({
            "name": music.name,
            "similarity": cosine_similarity,
            "id": str(music.id)
        })

    sorted_results = sorted(results, key=lambda x: x["similarity"], reverse=True)

    for result in sorted_results[:5]:
        print(f"Name: {result['name']}, Similarity: {result['similarity']:.4f}")

    return jsonify(sorted_results[:5]), 200