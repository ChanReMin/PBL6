from datetime import datetime

from mongoengine import DateTimeField, Document, EmbeddedDocumentField, LazyReferenceField, ListField, StringField, \
    URLField
from app.models.query_set.music_query_set import MusicQuerySet


class Music(Document):
    name = StringField(required=True)
    artists = ListField(LazyReferenceField('Artist'), required=True)
    genres = ListField(LazyReferenceField('Genre'), required=True)
    audio_url = URLField()
    karaoke_url = URLField()
    lyrics = ListField(ListField(EmbeddedDocumentField('Word')))
    thumbnail_url = URLField()
    created_at = DateTimeField(default=datetime.now())
    updated_at = DateTimeField(default=datetime.now())
    deleted_at = DateTimeField()

    meta = {
        'collection': 'musics',
        'queryset_class': MusicQuerySet
    }

    def create(self):
        if not self.created_at:
            self.created_at = datetime.now()
        self.updated_at = datetime.now()
        return self.save()

    def jsonify(self, *args, **kwargs):
        return {
            'id': str(self.id),
            'name': self.name,
            'artists': [artist.fetch().jsonify() for artist in self.artists],
            'genres': [genre.fetch().jsonify() for genre in self.genres],
            'audio_url': self.audio_url,
            'karaoke_url': self.karaoke_url,
            'lyrics': [[word.jsonify() for word in sentence] for sentence in self.lyrics],
            'thumbnail_url': self.thumbnail_url,
        }
