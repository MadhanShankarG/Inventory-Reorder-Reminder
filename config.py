import os

from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/inventory_db')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret')
    JWT_SECRET = os.getenv('JWT_SECRET', 'dev-jwt-secret')
    JWT_ALGORITHM = 'HS256'
    ACCESS_TOKEN_EXPIRES = 3600
    REFRESH_TOKEN_EXPIRES = 604800
