import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["retail_dashboard"]
    
    sale = await db.sales.find_one()
    if sale:
        print(f"Sale PID Type: {type(sale['product_id'])}")
        print(f"Sale Date Type: {type(sale['date'])}")
        print(f"Sale Content: {sale}")
    else:
        print("No sales found")

if __name__ == "__main__":
    asyncio.run(check())
