import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add the current directory to path so we can import ml_engine
sys.path.append(os.getcwd() + "/backend")
import ml_engine

async def run():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["retail_dashboard"]
    
    pids = await db.products.distinct("product_id")
    print(f"Triggering forecast for IDs: {pids}")
    
    for pid in pids:
        print(f"Processing {pid}...")
        try:
            res = await ml_engine.generate_forecast_mongo(db, pid)
            print(f"Generated {len(res)} forecasts for {pid}")
        except Exception as e:
            import traceback
            print(f"Error processing {pid}: {e}")
            print(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(run())
