# RetailSight_AI
RetailSight_AI is an AI-Driven Demand Forecasting System for Retail Inventory Management.

Many retail businesses struggle to maintain the right balance between supply and demand. Inaccurate demand forecasts lead to stock-outs, excess inventory, increased storage costs, and loss of customer trust. Traditional forecasting methods are often static, reactive, and fail to adapt to seasonal trends and changing consumer behavior.

This project focuses on building an **AI-driven demand forecasting system** that predicts future product demand using historical sales data. The system analyzes trends, seasonality, and demand patterns to generate accurate forecasts that support smarter inventory planning decisions. By providing data-driven insights, the solution helps retailers reduce waste, prevent shortages, and improve overall operational efficiency.

The proposed system is designed to be scalable, adaptable to changing market conditions, and suitable for real-world retail environments, enabling businesses to move from reactive inventory management to proactive demand planning.

## Tools & Technologies
- **Machine Learning:** XGBoost, Prophet
- **Backend:** Python, FastAPI
- **Frontend:** React.js, Vite, HTML, CSS, JavaScript
- **Database:** MongoDB
- **Data Processing:** Pandas, NumPy, Scikit-learn

## Core Features of RetailSight AI

1. Demand Forecasting Engine : 
Predicts future product demand using historical sales data by analyzing trends and seasonality with XGBoost and Prophet.

2. Seasonality-Aware Predictions : 
Automatically captures weekly, monthly, and festival-based patterns to handle demand spikes and drops.

3. Hybrid ML Model : 
Combines Prophet for time-series trends and XGBoost for complex non-linear patterns to improve accuracy.

4. Smart Inventory Insights : 
Generates actionable insights to help retailers decide when and how much stock to reorder.

5. Real-Time Forecast API : 
Provides REST APIs to fetch predictions dynamically for dashboards and external systems.

6. Interactive Dashboard : 
React-based frontend to visualize demand trends, future forecasts, and product-level insights.
