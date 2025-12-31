from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client.get_database()  # if URI has db name it will be selected

# collections used across the app
items_col = db.get_collection('items')
users_col = db.get_collection('users')
reminders_col = db.get_collection('reminders')
logs_col = db.get_collection('logs')
alerts_col = db.get_collection('alerts')
