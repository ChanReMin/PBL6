from mongoengine import LazyReferenceField, ListField

from .genre import Genre
from .enum.account_role import AccountRole
from .base.extended_account import ExtendedAccount
from .query_set.user_query_set import UserQuerySet


class User(ExtendedAccount):
    favourite_genres = ListField(LazyReferenceField(Genre))  # Embedded list field for favourite genres

    meta = {'queryset_class': UserQuerySet}

    def jsonify(self):
        return super().jsonify() | {
            'role': AccountRole.USER.value,
        }
