from mongoengine import DateField, EmailField, EmbeddedDocumentField, FloatField, IntField, ListField, StringField, \
    LazyReferenceField
from pymongo import MongoClient
from bson import ObjectId
from ..base.account import Account
from ..embedded_document.comment import Comment
from ..embedded_document.notification import Notification
from ..video import Video


class ExtendedAccount(Account):
    email = EmailField(required=True, unique=True)
    followers_count = IntField(default=0)
    following_count = IntField(default=0)
    date_of_birth = DateField(required=True)
    bio = StringField(max_length=255)
    user_vector = ListField(FloatField())
    notifications = ListField(EmbeddedDocumentField(Notification))
    like_videos = ListField(LazyReferenceField(Video), default=list)
    like_comments = ListField(EmbeddedDocumentField(Comment))

    meta = {'allow_inheritance': True}

    @classmethod
    def get_by_email(cls, email):
        return cls.objects(email=email).first()

    def add_like_video(self, video_id):
        video_id = ObjectId(video_id)
        if not any(like_video.id == video_id for like_video in self.like_videos):
            with MongoClient().start_session() as session:
                with session.start_transaction():
                    try:
                        video = Video.objects(id=video_id).first()
                        if video:
                            self.like_videos.append(video_id)
                            self.save()
                            video.update(inc__like_count=1)
                            return video.like_count
                    except Exception as e:
                        print(f"Transaction aborted due to: {e}")
                        raise
        return -1

    def jsonify(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "followers_count": self.followers_count,
            "following_count": self.following_count,
            "date_of_birth": self.date_of_birth.strftime('%Y-%m-%d') if self.date_of_birth else None,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
