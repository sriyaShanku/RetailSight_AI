import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def verify_seeding():
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DATABASE_NAME")
    
    print(f"Connecting to: {db_name}...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        product_count = await db.products.count_documents({})
        sales_count = await db.sales.count_documents({})
        
        print("\n--- SEEDING VERIFICATION ---")
        print(f"✅ Products found: {product_count}")
        print(f"✅ Sales records found: {sales_count}")
        
        if product_count > 0 and sales_count > 0:
            print("\nSUCCESS: Data successfully uploaded to MongoDB Atlas!")
        else:
            print("\nWARNING: Collections seem empty. Double check the seed_data.py execution.")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(verify_seeding())
