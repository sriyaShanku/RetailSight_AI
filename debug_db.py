import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["retail_dashboard"]
    
    prods = await db.products.count_documents({})
    sales = await db.sales.count_documents({})
    forecasts = await db.forecasts.count_documents({})
    recs = await db.recommendations.count_documents({})
    
    print(f"Products: {prods}")
    print(f"Sales: {sales}")
    print(f"Forecasts: {forecasts}")
    print(f"Recommendations: {recs}")
    
    if recs > 0:
        sample = await db.recommendations.find_one()
        print(f"Sample Rec: {sample}")
    
    if prods > 0:
        sample_prod = await db.products.find_one()
        print(f"Sample Prod: {sample_prod}")

if __name__ == "__main__":
    asyncio.run(check())
