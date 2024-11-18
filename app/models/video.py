from datetime import datetime

from bson import ObjectId
from mongoengine import DateTimeField, Document, EmbeddedDocumentField, IntField, LazyReferenceField, ListField, StringField, URLField
from .query_set.video_query_set import VideoQuerySet


class Video(Document):
    user = LazyReferenceField('ExtendedAccount', required=True)
    music = LazyReferenceField('Music', required=True)
    score = EmbeddedDocumentField('Score')
    video_url = URLField()
    like_count = IntField(default=0)
    title = StringField(required=True)
    comments = ListField(EmbeddedDocumentField('Comment'))

    created_at = DateTimeField(default=datetime.now())
    updated_at = DateTimeField(default=datetime.now())
    deleted_at = DateTimeField()

    meta = {
        'collection': 'videos',
        'queryset_class': VideoQuerySet
    }

    @classmethod
    def get_random_videos(cls, count):
        total_videos = cls.objects.count()
        sample_size = min(count, total_videos)
        pipeline = [
            {"$sample": {"size": sample_size}}
        ]
        video_lists = list(cls.objects.aggregate(pipeline))

        return [cls.objects.get(id=ObjectId(video_dict['_id'])) for video_dict in video_lists]

    def jsonify(self):
        return {
            'id': str(self.id),
            'user': self.user.fetch().jsonify(),
            'music': self.music.fetch().jsonify(),
            'video_url': self.video_url,
            'like_count': self.like_count,
            'comments': [comment.jsonify() for comment in self.comments],
        }
