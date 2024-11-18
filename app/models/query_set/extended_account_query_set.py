from bson import ObjectId
from mongoengine import QuerySet
from pymongo import MongoClient

from app.models.video import Video

class ExtendedAccountQuerySet(QuerySet):
    def like_video(self, user_id: str, video_id: str):
        video_id = ObjectId(video_id)
        user = self.filter(id=user_id).first()

        if not any(like_video.id == video_id for like_video in user.like_videos):
            with MongoClient().start_session() as session:
                with session.start_transaction():
                    try:
                        video = Video.objects(id=video_id).first()
                        if video:
                            user.like_videos.append(video_id)
                            user.save()
                            video.update(inc__like_count=1)
                            return video.like_count + 1
                    except Exception as e:
                        print(f"Transaction aborted due to: {e}")
                        raise

    def unlike_video(self, user_id: str, video_id: str):
        video_id = ObjectId(video_id)
        user = self.filter(id=user_id).first()

        if any(like_video.id == video_id for like_video in user.like_videos):
            with MongoClient().start_session() as session:
                with session.start_transaction():
                    try:
                        video = Video.objects(id=video_id).first()
                        if video:
                            user.like_videos.remove(video)
                            user.save()
                            video.update(inc__like_count=-1)
                            return video.like_count - 1
                    except Exception as e:
                        print(f"Transaction aborted due to: {e}")
                        raise
