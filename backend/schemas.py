from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, date

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ProductBase(BaseModel):
    product_id: str
    product_name: str
    category: str
    unit_price: float
    current_inventory: float

class Product(ProductBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SaleBase(BaseModel):
    product_id: str
    date: date
    quantity_sold: float
    revenue: float
    promotion_active: bool = False

class Sale(SaleBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ForecastBase(BaseModel):
    product_id: str
    forecast_date: date
    predicted_demand: float
    confidence_lower: float
    confidence_upper: float

class Forecast(ForecastBase):
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class Recommendation(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    category: Optional[str] = None
    reorder_quantity: float
    reorder_date: date
    safety_stock: float
    risk_level: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
