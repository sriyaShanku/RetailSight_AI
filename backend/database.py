import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection string - using localhost by default
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "retail_dashboard")

# Set a shorter timeout so it doesn't hang if Mongo isn't running
client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client[DATABASE_NAME]

async def get_database():
    # Return the db object directly. 
    # The actual connection check happens when we perform an operation.
    return db
