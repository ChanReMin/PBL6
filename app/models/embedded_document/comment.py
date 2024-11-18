from datetime import datetime

from bson import ObjectId
from mongoengine import DateTimeField, EmbeddedDocument, IntField, LazyReferenceField, ObjectIdField, StringField

class Comment(EmbeddedDocument):
    _id = ObjectIdField(default=ObjectId, required=True, primary_key=True)
    user = LazyReferenceField('ExtendedAccount', required=True)
    to_comment = LazyReferenceField('Comment', required=False)
    content = StringField(required=True)
    like_count = IntField(default=0)
    created_at = DateTimeField(default=datetime.now())

    def jsonify(self):
        return {
            'id': str(self._id),
            'user': self.user.fetch().jsonify(),
            # 'to_comment': self.to_comment.fetch().jsonify() if self.to_comment else None,
            'content': self.content,
            'like_count': self.like_count,
            'created_at': self.created_at,
        }