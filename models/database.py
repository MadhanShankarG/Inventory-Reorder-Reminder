from pymongo import MongoClient
from flask import current_app

class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.client = None
        self.db = None
        self._initialized = True

    def init_app(self, app):
        try:
            self.client = MongoClient(app.config['MONGO_URI'])
            self.db = self.client["inventory_db"]
            app.logger.info("Connected to MongoDB successfully!")
        except Exception as e:
            app.logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    @property
    def users(self):
        return self.db["users"]

    @property
    def inventory(self):
        return self.db["inventory"]

db = Database() 