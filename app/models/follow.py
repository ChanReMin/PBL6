from datetime import datetime

from mongoengine import DateTimeField, Document, LazyReferenceField

from app.models.query_set.follow_query_set import FollowQuerySet


class Follow(Document):
    follower = LazyReferenceField('ExtendedAccount', required=True)
    following = LazyReferenceField('ExtendedAccount', required=True)

    created_at = DateTimeField(default=datetime.now())

    meta = {
        'collection': 'follows',
        'queryset_class': FollowQuerySet,
        'indexes': [
            {'fields': ('follower', 'following'), 'unique': True}
        ],
    }

    def jsonify(self, *args, **kwargs):
        return {
            'follower': self.follower.id,
            'following': self.following.id,
            'created_at': self.created_at,
        }
