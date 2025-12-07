from pymongo import MongoClient
from models.user import User
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv()

def init_db():
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/cement_track_db')
    client = MongoClient(mongo_uri)
    db = client["cement_track_db"]
    
    # Create collections if they don't exist
    if "users" not in db.list_collection_names():
        db.create_collection("users")
        print("Created users collection")
    
    if "inventory" not in db.list_collection_names():
        db.create_collection("inventory")
        print("Created inventory collection")
    
    # Check if test user exists
    test_user = db.users.find_one({"username": "test@example.com"})
    if not test_user:
        # Create test user with hashed password
        hashed_password = bcrypt.hashpw("test123".encode('utf-8'), bcrypt.gensalt())
        user = User(
            username="test@example.com",
            password=hashed_password
        )
        user_dict = user.to_dict()
        result = db.users.insert_one(user_dict)
        print(f"Created test user with ID: {result.inserted_id}")
    else:
        print("Test user already exists")
    
    print("Database initialization completed!")

if __name__ == "__main__":
    init_db() 