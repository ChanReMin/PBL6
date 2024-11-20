from mongoengine import DateField, EmailField, EmbeddedDocumentField, FloatField, IntField, LazyReferenceField, ListField, StringField

from ..base.account import Account
from ..query_set.extended_account_query_set import ExtendedAccountQuerySet
import json


class ExtendedAccount(Account):
    email = EmailField(required=True, unique=True)
    followers_count = IntField(default=0)
    following_count = IntField(default=0)
    date_of_birth = DateField(required=True)
    bio = StringField(max_length=255)
    user_vector = ListField(FloatField())
    notifications = ListField(EmbeddedDocumentField('Notification'))
    like_videos = ListField(LazyReferenceField('Video'), default=list)
    like_comments = ListField(EmbeddedDocumentField('Comment'), default=list)

    meta = {
        'allow_inheritance': True,
        'queryset_class': ExtendedAccountQuerySet
    }

    @classmethod
    def get_by_email(cls, email):
        return cls.objects(email=email).first()

    def jsonify(self):
        return super().jsonify() | {
            "email": self.email,
            "followers_count": self.followers_count,
            "following_count": self.following_count,
            "date_of_birth": self.date_of_birth.strftime('%Y-%m-%d') if self.date_of_birth else None,
        }

    def to_dict(self):
        return json.dumps(self.jsonify(), default=str)