import pandas as pd
import numpy as np
from prophet import Prophet
from xgboost import XGBRegressor
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta, date, datetime
import asyncio

async def run_bulk_forecast(db, product_ids):
    for pid in product_ids:
        try:
            await generate_forecast_mongo(db, pid)
        except Exception as e:
            print(f"Error forecasting {pid}: {e}")

async def generate_forecast_mongo(db: AsyncIOMotorDatabase, product_id: str, days: int = 30):
    sales_cursor = db.sales.find({"product_id": str(product_id)}).sort("date", 1)
    sales_list = await sales_cursor.to_list(length=1000)
    
    if not sales_list: 
        print(f"No sales found for {product_id}")
        return []
    
    # 1. Prepare and Clean Data (Handle Multiple Sales per Date)
    data = []
    for s in sales_list:
        try:
            data.append({
                "ds": str(s["date"]), 
                "y": float(s.get("quantity_sold", 0))
            })
        except: continue
        
    df = pd.DataFrame(data)
    if df.empty: return []
    
    # Group by date to handle duplicate entries (transactional data)
    df['ds'] = pd.to_datetime(df['ds'])
    df = df.groupby('ds').agg({'y': 'sum'}).reset_index()
    df = df.sort_values('ds')
    
    dupes = df['ds'].duplicated().sum()
    if dupes > 0:
        print(f"CRITICAL: {product_id} still has {dupes} duplicate dates after grouping!")
    
    # Anchor precisely to the next day after the data tail
    data_max_date = df['ds'].max().date()
    anchor_date = data_max_date + timedelta(days=1)

    df_flag = False
    # 1. Hybrid ML Model (Prophet + XGBoost)
    if len(df) >= 5:
        # Auto-detect frequency
        try:
            freq = pd.infer_freq(df['ds'])
            if not freq: freq = 'D'
        except:
            freq = 'D'

        loop = asyncio.get_event_loop()
        async def run_ml_safe():
            try:
                def logic():
                    m = Prophet(
                        yearly_seasonality=False if len(df) < 366 else True, 
                        weekly_seasonality=True, 
                        daily_seasonality=False,
                        seasonality_mode='multiplicative' if (df['y'] > 0).all() else 'additive'
                    )
                    m.fit(df[['ds', 'y']])
                    future = m.make_future_dataframe(periods=days, freq=freq)
                    prophet_pred = m.predict(future)
                    
                    # XGBoost for local residuals
                    df['dow'] = df['ds'].dt.dayofweek
                    xgb = XGBRegressor(n_estimators=100, learning_rate=0.05)
                    xgb.fit(df[['dow']], df['y'])
                    
                    future['dow'] = future['ds'].dt.dayofweek
                    xgb_pred = xgb.predict(future[['dow']])
                    
                    # Combine
                    return 0.7 * prophet_pred['yhat'].values + 0.3 * xgb_pred
                
                return await loop.run_in_executor(None, logic)
            except Exception as e:
                print(f"ML Step Failed for {product_id}: {e}")
                return None

        final_preds = await run_ml_safe()
        
        if final_preds is not None:
            # We want the forecasted part (items after the training data)
            forecasts = []
            for i in range(len(df), len(final_preds)):
                val = max(0, int(final_preds[i]))
                p_date = anchor_date + timedelta(days=i - len(df))
                forecasts.append({
                    "product_id": str(product_id),
                    "forecast_date": str(p_date),
                    "predicted_demand": val,
                    "confidence_lower": int(val * 0.8),
                    "confidence_upper": int(val * 1.2),
                    "generated_at": datetime.utcnow()
                })
        else:
            # ML failed for this product, trigger small-data fallback
            df_flag = True

    if (len(df) < 5) or df_flag:
        # Fallback for small data or ML failures
        avg = df['y'].mean()
        forecasts = []
        for i in range(days):
            p_date = anchor_date + timedelta(days=i)
            val = max(0, int(avg * (1 + np.random.normal(0, 0.1))))
            forecasts.append({
                "product_id": str(product_id),
                "forecast_date": str(p_date),
                "predicted_demand": val,
                "confidence_lower": int(val * 0.7),
                "confidence_upper": int(val * 1.3),
                "generated_at": datetime.utcnow()
            })

    # Save Forecasts
    await db.forecasts.delete_many({"product_id": str(product_id)})
    await db.forecasts.insert_many(forecasts)

    # 2. Comprehensive Inventory Risk Analysis
    product = await db.products.find_one({"product_id": str(product_id)})
    if product:
        current_inv = float(product.get("current_inventory", 100))
        # Use average of forecast for daily velocity
        daily_velocity = sum([f["predicted_demand"] for f in forecasts]) / days
        if daily_velocity == 0: daily_velocity = 1.0
        
        days_of_stock = current_inv / daily_velocity
        
        if days_of_stock < 7: risk = "HIGH"
        elif days_of_stock < 21: risk = "MEDIUM"
        elif days_of_stock > 60: risk = "OVERSTOCK"
        else: risk = "LOW"

        rec = {
            "product_id": str(product_id),
            "product_name": product.get("product_name", product_id),
            "reorder_quantity": max(0, int((daily_velocity * 30) - current_inv)) if risk != "OVERSTOCK" else 0,
            "reorder_date": str(anchor_date + timedelta(days=max(1, int(days_of_stock)))),
            "safety_stock": int(daily_velocity * 7),
            "risk_level": risk,
            "created_at": datetime.utcnow()
        }
        
        await db.recommendations.update_one(
            {"product_id": str(product_id)},
            {"$set": rec},
            upsert=True
        )
    
    return forecasts
