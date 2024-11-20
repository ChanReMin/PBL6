from datetime import datetime
import os

from dotenv import load_dotenv
from flask_bcrypt import check_password_hash, generate_password_hash
from mongoengine import BinaryField, BooleanField, DateTimeField, Document, StringField, URLField
load_dotenv()

# print(os.getenv('DEFAULT_AVATAR_URL'))

class Account(Document):
    username = StringField(required=True, unique=True, max_length=50)
    name = StringField(required=True)
    password = BinaryField()
    avatar_url = URLField(default=os.getenv('DEFAULT_AVATAR_URL'))
    gender = BooleanField()

    created_at = DateTimeField(default=datetime.now())
    updated_at = DateTimeField(default=datetime.now())
    deleted_at = DateTimeField()

    meta = {'allow_inheritance': True, 'collection': 'accounts'}

    def check_password(self, password):
        if self.password is None:
            return None
        return check_password_hash(self.password, password)

    def soft_delete(self):
        self.deleted_at = datetime.now()  # Set the deleted_at timestamp
        self.update(set__deleted_at=self.deleted_at)

    def set_password(self, password):
        self.password = generate_password_hash(password)
        return self

    def jsonify(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "name": self.name,
            "avatar_url": self.avatar_url,
            "gender": self.gender,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            "updated_at": self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None,
            "deleted_at": self.deleted_at.strftime('%Y-%m-%d %H:%M:%S') if self.deleted_at else None,
        }
