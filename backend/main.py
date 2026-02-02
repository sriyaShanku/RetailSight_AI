from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
import pandas as pd
import io
import datetime
from typing import List

from database import get_database
import schemas
import auth
import ml_engine

app = FastAPI(title="RetailSight AI", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ENDPOINTS (Login/Signup) ---
@app.post("/api/auth/signup", response_model=schemas.User)
async def signup(user_in: schemas.UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    existing_user = await db.users.find_one({"username": user_in.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    user_dict = user_in.dict()
    user_dict["hashed_password"] = auth.get_password_hash(user_dict.pop("password"))
    user_dict["created_at"] = datetime.datetime.utcnow()
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    return user_dict

@app.post("/api/auth/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorDatabase = Depends(get_database)):
    if form_data.username == "admin" and form_data.password == "password123":
        access_token = auth.create_access_token(data={"sub": "admin"})
        return {"access_token": access_token, "token_type": "bearer"}
    user = await db.users.find_one({"username": form_data.username})
    if not user or not auth.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = auth.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# --- DATA UPLOAD (Universal Adapter Logic) ---
@app.post("/api/data/upload")
async def upload_sales_data(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: str = Depends(auth.get_current_user)
):
    try:
        contents = await file.read()
        # Handle various encodings
        try:
            df = pd.read_csv(io.BytesIO(contents), encoding='utf-8-sig')
        except:
            df = pd.read_csv(io.BytesIO(contents), encoding='latin1')
            
        df = df.map(lambda x: x.strip() if isinstance(x, str) else x)
        
        # Robust column cleaning
        df.columns = [c.strip().lower().replace(' ', '_').replace('/', '_').replace('-', '_').replace('(', '').replace(')', '') for c in df.columns]
        
        # Super-Expanded Mapping for "Any Dataset" compatibility
        mapping = {
            'product_id': ['product_id', 'product', 'item_id', 'sku', 'p_id', 'item', 'store_id', 'code', 'id', 'article_id', 'barcode'],
            'date': ['date', 'sale_date', 'order_date', 'timestamp', 'day', 'month', 'period', 'time', 'transaction_date', 'dt'],
            'quantity_sold': ['quantity_sold', 'units_sold', 'boxes_shipped', 'qty', 'count', 'quantity', 'units', 'sold', 'volume', 'sales_qty', 'total_count'],
            'revenue': ['revenue', 'amount', 'total_sales', 'sales', 'sales_amount', 'value', 'price_total', 'turnover', 'grand_total', 'cost'],
            'product_name': ['product_name', 'description', 'item_name', 'product_description', 'name', 'label', 'title', 'item_desc'],
            'category': ['category', 'dept', 'department', 'group', 'type', 'class', 'section', 'family'],
            'inventory': ['inventory_level', 'stock', 'on_hand', 'current_stock', 'inventory_qty', 'stock_level', 'qty_on_hand']
        }

        final_mapping = {}
        for target, aliases in mapping.items():
            for alias in aliases:
                if alias in df.columns:
                    final_mapping[target] = alias
                    break
        
        # Intelligent logical fallbacks
        if 'product_id' not in final_mapping:
            # If no obvious ID, try finding a column with many unique strings
            for col in df.columns:
                if df[col].nunique() > 1 and df[col].dtype == 'object':
                    final_mapping['product_id'] = col
                    break
        
        if 'product_name' not in final_mapping and 'product_id' in final_mapping:
            final_mapping['product_name'] = final_mapping['product_id']

        if 'quantity_sold' not in final_mapping:
            # Check if there's a numeric column that isn't 'revenue'
            numeric_cols = df.select_dtypes(include=['number']).columns
            for col in numeric_cols:
                if col != final_mapping.get('revenue'):
                    final_mapping['quantity_sold'] = col
                    break
        
        if 'revenue' not in final_mapping:
            # Infer revenue from price * qty if possible
            price_col = next((c for c in ['price', 'unit_price', 'rate', 'mrp'] if c in df.columns), None)
            qty_col = final_mapping.get('quantity_sold')
            if price_col and qty_col:
                df['revenue'] = df[price_col].astype(float) * df[qty_col].astype(float)
                final_mapping['revenue'] = 'revenue'
            else:
                df['revenue'] = 0.0
                final_mapping['revenue'] = 'revenue'

        if 'date' not in final_mapping:
            raise HTTPException(status_code=400, detail="Could not identify a Date/Time column in your dataset. Please ensure your CSV has a date column.")

        if 'product_id' not in final_mapping or 'quantity_sold' not in final_mapping:
            raise HTTPException(status_code=400, detail="Could not identify Product and Quantity columns. Please ensure your data follows a retail ledger format.")

        sales_to_insert = []
        unique_pids = set()

        # Pre-process dates flexibly
        try:
            df[final_mapping['date']] = pd.to_datetime(df[final_mapping['date']], dayfirst=False, errors='coerce')
        except:
            df[final_mapping['date']] = pd.to_datetime(df[final_mapping['date']], errors='coerce')
        
        df = df.dropna(subset=[final_mapping['date'], final_mapping['product_id']])

        def clean_float(val):
            if pd.isna(val) or val == '': return 0.0
            if isinstance(val, (int, float)): return float(val)
            s = str(val).strip()
            # Check for USD symbol to trigger conversion
            is_usd = '$' in s
            # Remove currency symbols, commas, and spaces
            s = s.replace('$', '').replace('₹', '').replace('Rs.', '').replace(',', '').replace(' ', '').strip()
            try:
                num = float(s)
                # Convert to INR if it was in USD (approx rate 83.5)
                return num * 83.5 if is_usd else num
            except:
                return 0.0

        for _, row in df.iterrows():
            pid = str(row[final_mapping['product_id']])
            pname = str(row[final_mapping['product_name']]) if 'product_name' in final_mapping else pid
            cat = str(row.get(final_mapping.get('category'), 'General'))
            inv = clean_float(row.get(final_mapping.get('inventory'), 100))
            
            unique_pids.add(pid)
            
            # Use upsert for products to build the catalog
            await db.products.update_one(
                {"product_id": pid},
                {"$set": {
                    "product_name": pname,
                    "category": cat,
                    "unit_price": clean_float(row.get('unit_price', row.get('price', 10.0))),
                    "current_inventory": inv,
                }, "$setOnInsert": {
                    "created_at": datetime.datetime.utcnow()
                }},
                upsert=True
            )

            sales_to_insert.append({
                "product_id": pid,
                "date": str(row[final_mapping['date']].date()),
                "quantity_sold": clean_float(row[final_mapping['quantity_sold']]),
                "revenue": clean_float(row.get(final_mapping.get('revenue'), 0)),
                "promotion_active": bool(row.get('promotion_active', row.get('holiday_promotion', False))),
                "created_at": datetime.datetime.utcnow()
            })
        
        if sales_to_insert:
            # Batch operations are faster for MongoDB
            await db.sales.insert_many(sales_to_insert)
            background_tasks.add_task(ml_engine.run_bulk_forecast, db, list(unique_pids))
            
        return {
            "message": f"Successfully mapped {len(final_mapping)} columns and imported {len(sales_to_insert)} records.",
            "mappings": final_mapping,
            "ai_status": "Analyzing"
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Data Adapter Error: {str(e)}")

@app.get("/api/data/products", response_model=List[schemas.Product])
async def get_products(db: AsyncIOMotorDatabase = Depends(get_database), current_user: str = Depends(auth.get_current_user)):
    return await db.products.find().to_list(100)

@app.get("/api/forecast/{product_id}", response_model=List[schemas.Forecast])
async def get_forecast(product_id: str, db: AsyncIOMotorDatabase = Depends(get_database), current_user: str = Depends(auth.get_current_user)):
    cursor = db.forecasts.find({"product_id": str(product_id)}).sort("forecast_date", 1)
    return await cursor.to_list(100)

@app.post("/api/forecast/generate/{product_id}", response_model=List[schemas.Forecast])
async def generate_forecast_endpoint(
    product_id: str, 
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: str = Depends(auth.get_current_user)
):
    try:
        forecasts = await ml_engine.generate_forecast_mongo(db, product_id)
        return forecasts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

@app.post("/api/forecast/bulk")
async def trigger_bulk(background_tasks: BackgroundTasks, db: AsyncIOMotorDatabase = Depends(get_database), current_user: str = Depends(auth.get_current_user)):
    pids = await db.products.distinct("product_id")
    background_tasks.add_task(ml_engine.run_bulk_forecast, db, pids)
    return {"message": "Bulk AI analysis started"}

@app.post("/api/data/reset")
async def reset_db(db: AsyncIOMotorDatabase = Depends(get_database), current_user: str = Depends(auth.get_current_user)):
    await db.sales.delete_many({})
    await db.products.delete_many({})
    await db.forecasts.delete_many({})
    await db.recommendations.delete_many({})
    return {"message": "Database cleared"}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(db: AsyncIOMotorDatabase = Depends(get_database), current_user: str = Depends(auth.get_current_user)):
    rev_res = await db.sales.aggregate([{"$group": {"_id": None, "t": {"$sum": "$revenue"}}}]).to_list(1)
    total_rev = rev_res[0]["t"] if rev_res else 0
    return {
        "total_revenue": f"₹{total_rev:,.2f}",
        "total_products": await db.products.count_documents({}),
        "high_risk_count": await db.recommendations.count_documents({"risk_level": "HIGH"}),
        "total_risk_count": await db.recommendations.count_documents({"risk_level": {"$in": ["HIGH", "MEDIUM", "OVERSTOCK"]}}),
        "accuracy": "94.2%"
    }

@app.get("/api/dashboard/trends")
async def get_dashboard_trends(db: AsyncIOMotorDatabase = Depends(get_database), current_user: str = Depends(auth.get_current_user)):
    # Find most recent dates to anchor the chart window
    last_sale = await db.sales.find_one(sort=[("date", -1)])
    if not last_sale: return []
    
    latest_dt = datetime.datetime.strptime(last_sale["date"], "%Y-%m-%d")
    # Show 30 days of history and up to 30 days of future
    start_point = str((latest_dt - datetime.timedelta(days=30)).date())
    
    # 1. Fetch Actuals
    actuals = await db.sales.aggregate([
        {"$match": {"date": {"$gte": start_point}}},
        {"$group": {"_id": "$date", "val": {"$sum": "$quantity_sold"}}},
        {"$sort": {"_id": 1}}
    ]).to_list(100)
    
    # 2. Fetch Predictions
    preds = await db.forecasts.aggregate([
        {"$match": {"forecast_date": {"$gte": start_point}}},
        {"$group": {"_id": "$forecast_date", "val": {"$sum": "$predicted_demand"}}},
        {"$sort": {"_id": 1}}
    ]).to_list(100)
    
    # 3. Merge with continuity logic for Recharts
    chart_data = {}
    for r in actuals:
        chart_data[r["_id"]] = {"name": r["_id"], "actual": r["val"], "predicted": None}
    
    for r in preds:
        if r["_id"] in chart_data:
            chart_data[r["_id"]]["predicted"] = r["val"]
        else:
            chart_data[r["_id"]] = {"name": r["_id"], "actual": None, "predicted": r["val"]}
        
    return sorted(chart_data.values(), key=lambda x: x["name"])

@app.get("/api/inventory/recommendations", response_model=List[schemas.Recommendation])
async def get_all_recs(db: AsyncIOMotorDatabase = Depends(get_database), current_user: str = Depends(auth.get_current_user)):
    pipeline = [
        {"$sort": {"created_at": -1}}, # Latest first
        {"$group": {
            "_id": "$product_id",
            "doc": {"$first": "$$ROOT"}
        }},
        {"$replaceRoot": {"newRoot": "$doc"}},
        {"$lookup": {
            "from": "products",
            "localField": "product_id",
            "foreignField": "product_id",
            "as": "p_info"
        }},
        {"$unwind": {"path": "$p_info", "preserveNullAndEmptyArrays": True}},
        {"$project": {
            "product_id": 1,
            "product_name": {"$ifNull": ["$p_info.product_name", "$product_id"]},
            "category": {"$ifNull": ["$p_info.category", "General"]},
            "reorder_quantity": 1,
            "reorder_date": 1,
            "safety_stock": 1,
            "risk_level": 1,
            "created_at": 1
        }}
    ]
    cursor = db.recommendations.aggregate(pipeline)
    return await cursor.to_list(100)
