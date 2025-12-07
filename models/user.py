from datetime import datetime
import bcrypt
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class User:
    def __init__(self, username, password=None, _id=None, created_at=None):
        self.username = username
        self._id = _id
        self.created_at = created_at or datetime.utcnow()
        # Only hash password if it's provided and not already hashed
        if password and not isinstance(password, bytes):
            logger.debug(f"Hashing new password for user {username}")
            self.password = self.hash_password(password)
        else:
            logger.debug(f"Using existing password for user {username}")
            self.password = password

    @staticmethod
    def hash_password(password):
        if isinstance(password, str):
            logger.debug("Hashing string password")
            return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        logger.debug("Password is already hashed or None")
        return password

    def verify_password(self, password):
        if not self.password:
            logger.debug("No password stored for user")
            return False
        if isinstance(password, str):
            logger.debug("Verifying string password")
            try:
                result = bcrypt.checkpw(password.encode('utf-8'), self.password)
                logger.debug(f"Password verification result: {result}")
                return result
            except Exception as e:
                logger.error(f"Error verifying password: {str(e)}")
                return False
        logger.debug("Password is not a string")
        return False

    def to_dict(self):
        data = {
            'username': self.username,
            'password': self.password,
            'created_at': self.created_at
        }
        if self._id:
            data['_id'] = self._id
        return data

    @classmethod
    def from_dict(cls, data):
        logger.debug(f"Creating user from dict: {data.get('username')}")
        return cls(
            username=data['username'],
            password=data.get('password'),
            _id=data.get('_id'),
            created_at=data.get('created_at')
        )
