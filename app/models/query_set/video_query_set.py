from bson import ObjectId
from mongoengine import QuerySet
from pymongo import MongoClient

from app.models.base.extended_account import ExtendedAccount
from app.models.embedded_document.comment import Comment


class VideoQuerySet(QuerySet):
    def get_random_videos(self, count, user_id: str = None):
        total_videos = self.count()
        sample_size = max(1, total_videos)
        pipeline = [
            {"$match": {"public": True}},
            {"$sample": {"size": sample_size}},
            # Bước này TẠO trường total_comments_count bằng $size
            {
                "$addFields": {
                    "comments": {
                        "$ifNull": ["$comments", []]
                    }
                }
            },
            # Sau đó tính total_comments_count = size($comments)
            {
                "$addFields": {
                    "total_comments_count": {"$size": "$comments"}
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "user": 1,
                    "music": 1,
                    "video_url": 1,
                    "like_count": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "title": 1,
                    "comments": {
                        "$filter": {
                            "input": "$comments",
                            "as": "comment",
                            "cond": {"$not": ["$$comment.father_comment_id"]}
                            # "cond": {"$eq": ["$$comment.father_comment_id", None]}

                        }
                    },
                    "music_start": 1,
                    "music_end": 1,
                    "total_comments_count": 1  # Thêm dòng này
                }
            }
        ]
        video_lists = list(self.aggregate(*pipeline))
        from app.models.video import Video

        user = ExtendedAccount.objects(id=user_id).first() if user_id else None
        videos = []
        for video_dict in video_lists:
            video = Video.from_dict(**video_dict)
            is_liked = (video.id in [v.id for v in user.like_videos]) if user else False
            videos.append((video, is_liked))
        return videos

    def get_videos_by_user(self, user_id: str):
        return self.filter(user=user_id).all()

    def like_video(self, user_id: str, video_id: str):
        video_id = ObjectId(video_id)
        user = ExtendedAccount.objects(id=user_id).first()

        if not any(like_video.id == video_id for like_video in user.like_videos):
            with MongoClient().start_session() as session:
                with session.start_transaction():
                    try:
                        video = self.filter(id=video_id).first()
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
        user = ExtendedAccount.objects(id=user_id).first()

        if any(like_video.id == video_id for like_video in user.like_videos):
            with MongoClient().start_session() as session:
                with session.start_transaction():
                    try:
                        video = self.filter(id=video_id).first()
                        if video:
                            user.like_videos.remove(video)
                            user.save()
                            video.update(inc__like_count=-1)
                            return video.like_count - 1
                    except Exception as e:
                        print(f"Transaction aborted due to: {e}")
                        raise

    def add_comment(self, user_id: str, video_id: str, content: str, father_comment_id: str, grand_comment_id: str):
        comment = Comment(user=user_id, content=content, father_comment_id=father_comment_id,
                          grand_comment_id=grand_comment_id)

    # def add_comment(self, user_id: str, video_id: str, content: str, father_comment_id: str, grand_comment_id: str):
    #     user_obj = ExtendedAccount.objects(id=user_id).first()
    #     comment = Comment(
    #         user=user_obj,
    #         content=content,
    #         father_comment_id=father_comment_id,
    #         grand_comment_id=grand_comment_id
    #     )

        with MongoClient().start_session() as session:
            with session.start_transaction():
                try:
                    video = self.filter(id=video_id).first()
                    if video:
                        if grand_comment_id:
                            # Locate the parent comment
                            father_comment, grand_comment = [
                                next((c for c in video.comments if str(c._id) == cid), None)
                                for cid in (father_comment_id, grand_comment_id)
                            ]

                            if not father_comment or not grand_comment:
                                raise ValueError("Parent/Grand comment not found")

                            grand_comment.child_count += 1

                            comment.father_comment_user = father_comment.user

                        video.comments.append(comment)
                        video.save()
                        return comment._id
                    else:
                        raise ValueError("Video not found")
                except Exception as e:
                    print(f"Transaction aborted due to: {e}")
                    raise e

    def like_comment(self, user_id: str, video_id: str, comment_id: str):
        from app.models.base.extended_account import ExtendedAccount
        video_id = ObjectId(video_id)
        comment_oid = ObjectId(comment_id)
        user = ExtendedAccount.objects(id=user_id).first()

        if not user:
            return None

        with MongoClient().start_session() as session:
            with session.start_transaction():
                try:
                    video = self.filter(id=video_id).first()
                    if video:
                        if comment_oid in user.like_comments:
                            return None
                        for cmt in video.comments:
                            if cmt.id == comment_oid:
                                user.like_comments.append(comment_oid)
                                user.save()
                                cmt.like_count += 1
                                video.save()
                                return cmt.like_count
                    return None
                except Exception as e:
                    print(f"Transaction aborted due to: {e}")
                    raise

    def unlike_comment(self, user_id: str, video_id: str, comment_id: str):
        from app.models.base.extended_account import ExtendedAccount
        video_id = ObjectId(video_id)
        comment_oid = ObjectId(comment_id)
        user = ExtendedAccount.objects(id=user_id).first()

        if not user:
            return None
        with MongoClient().start_session() as session:
            with session.start_transaction():
                try:
                    video = self.filter(id=video_id).first()
                    if video:
                        if comment_oid in user.like_comments:
                            user.like_comments.remove(comment_oid)
                            user.save()
                            cmt = next((c for c in video.comments if c._id == comment_oid), None)
                            if cmt:
                                cmt.like_count -= 1
                                video.save()
                                return cmt.like_count
                        return None
                    return None
                except Exception as e:
                    print(f"Transaction aborted due to: {e}")
                    raise


    def update_comment(self, video_id, comment_id: str, comment_content: str):
        return self.filter(id=video_id, comments__match={'_id': ObjectId(comment_id)}).update(
            set__comments__S__content=comment_content) is not None

    def delete_comment(self, video_id, comment_id: str):
        video = self.filter(id=video_id).first()
        comment_oid = ObjectId(comment_id)
        if video:
            comment = next((c for c in video.comments if c._id == comment_oid), None)
            if comment:
                if comment.father_comment_id:  # If this is a child comment
                    grand_comment = next((c for c in video.comments if c._id == comment.grand_comment_id), None)
                    grand_comment.child_count -= 1
                else:
                    child_comments = [c for c in video.comments if c.grand_comment_id == comment_oid]
                    for child_comment in child_comments:
                        video.comments.remove(child_comment)

                video.comments.remove(comment)
                video.save()
            else:
                raise ValueError("Comment not found")
        else:
            raise ValueError("Video not found")

    def get_replies(self, video_id, comment_id: str, skip: int, limit: int = 3):
        comment_obj_id = ObjectId(comment_id)

        pipeline = [
            {'$match': {'_id': ObjectId(video_id)}},
            {'$unwind': '$comments'},
            {'$match': {'comments.grand_comment_id': comment_obj_id}},
            {'$sort': {'comments.created_at': 1}},
            {'$skip': skip},
            {'$limit': limit},
            {'$group': {
                '_id': '$_id',
                'replies': {'$push': '$comments'}
            }},
            {'$project': {
                'replies': 1,
                '_id': 0
            }}
        ]

        result = list(self.aggregate(pipeline))

        if result:
            return result[0]['replies']
        else:
            return []
