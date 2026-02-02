import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["retail_dashboard"]
    
    pipeline = [
        {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}
    ]
    res = await db.recommendations.aggregate(pipeline).to_list(100)
    print(f"Risk levels: {res}")

if __name__ == "__main__":
    asyncio.run(check())
