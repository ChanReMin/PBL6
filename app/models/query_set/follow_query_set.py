from bson import ObjectId
from mongoengine import QuerySet


class FollowQuerySet(QuerySet):
    def follow(self, follower_id, following_id):
        follow = self.filter(follower=follower_id, following=following_id).first()

        if not follow:
            from models.follow import Follow
            follow = Follow(follower=follower_id, following=following_id)
            follow.save()

            from models.base.extended_account import ExtendedAccount
            ExtendedAccount.objects(id=follower_id).update(inc__following_count=1)
            ExtendedAccount.objects(id=following_id).update(inc__followers_count=1)

        return follow

    def unfollow(self, follower_id, following_id):
        follow = self.filter(follower=follower_id, following=following_id).first()
        if follow:
            follow.delete()

            from models.base.extended_account import ExtendedAccount
            ExtendedAccount.objects(id=follower_id).update(dec__following_count=1)
            ExtendedAccount.objects(id=following_id).update(dec__followers_count=1)

        return follow

    def get_follow_status(self, follower_id, following_id):
        return self.filter(follower=follower_id, following=following_id).first() is not None

    def get_follower(self, following_id):
        return self.filter(following=following_id).all()

    def get_following(self, follower_id):
        return self.filter(follower=follower_id).all()



