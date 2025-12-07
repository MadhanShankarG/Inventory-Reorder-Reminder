from models.database import db
from models.user import User
from config import config
from flask import Flask
import logging
from bson import ObjectId

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_db_connection():
    try:
        # Create a Flask app instance
        app = Flask(__name__)
        app.config.from_object(config['development'])
        
        # Initialize database
        db.init_app(app)
        
        # Test connection by listing collections
        collections = db.db.list_collection_names()
        logger.info(f"Connected to database. Collections: {collections}")
        
        # Create a test user
        test_user = User(
            username="testuser",
            password="testpass123"  # This will be automatically hashed
        )
        
        # Check if user already exists
        existing_user = db.users.find_one({'username': test_user.username})
        if existing_user:
            logger.info(f"User {test_user.username} already exists")
            return
        
        # Insert the test user
        user_dict = test_user.to_dict()
        result = db.users.insert_one(user_dict)
        logger.info(f"Test user created with ID: {result.inserted_id}")
        
        # Verify the user was created
        created_user = db.users.find_one({'_id': result.inserted_id})
        if created_user:
            logger.info("Successfully verified test user in database")
            logger.info(f"User data: {created_user}")
        else:
            logger.error("Failed to verify test user creation")
            
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    test_db_connection() 