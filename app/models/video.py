from datetime import datetime

# from flask_jwt_extended import current_user
from mongoengine import DateTimeField, Document, EmbeddedDocumentField, IntField, LazyReferenceField, ListField, \
    StringField, URLField, BooleanField

from app.models.query_set.video_query_set import VideoQuerySet


class Video(Document):
    user = LazyReferenceField('ExtendedAccount', required=True)
    music = LazyReferenceField('Music', required=True)
    score = EmbeddedDocumentField('Score')
    video_url = URLField()
    like_count = IntField(default=0)
    title = StringField()
    music_start = IntField()
    music_end = IntField()
    public = BooleanField(default=True)
    comments = ListField(EmbeddedDocumentField('Comment'))
    thumbnail_url = URLField()

    created_at = DateTimeField(default=datetime.now())
    updated_at = DateTimeField(default=datetime.now())
    deleted_at = DateTimeField()

    meta = {
        'collection': 'videos',
        'queryset_class': VideoQuerySet
    }

    def jsonify(self, current_user=None):
        print(__file__, 'video id', self.id)
        return {
            'id': str(self.id),
            'user': self.user.fetch().jsonify(),
            'music': self.music.fetch().jsonify(),
            'video_url': self.video_url,
            'like_count': self.like_count,
            'title': self.title,
            'music_start': self.music_start,
            'music_end': self.music_end,
            'public': self.public,
            'created_at': self.created_at,
            'comments': [
                # comment.jsonify() for comment in self.comments
                comment.jsonify(current_user=current_user) for comment in self.comments
            ],
            'total_comments_count': getattr(self, 'total_comments_count', 0),
            'thumbnail_url': self.thumbnail_url,
        }

    @classmethod
    def from_dict(cls, **data):
        from app.models.embedded_document.comment import Comment
        try:
            video = cls(
                id=data.get('_id'),
                user=data.get('user'),
                music=data.get('music'),
                score=data.get('score'),
                video_url=data.get('video_url'),
                like_count=data.get('like_count', 0),
                title=data.get('title'),
                music_start=data.get('music_start'),
                music_end=data.get('music_end'),
                comments=[Comment.from_dict(**cmt) for cmt in data.get('comments', None) or []],
                created_at=data.get('created_at'),
                updated_at=data.get('updated_at'),
                deleted_at=data.get('deleted_at'),
            )
        # GÁN THÊM total_comments_count LẤY TỪ pipeline
            video.total_comments_count = data.get('total_comments_count', 0)
            return video
        except Exception as e:
            raise e
