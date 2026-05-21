# Retail-Dashboard: AI Inventory Forecasting System

A comprehensive retail management system featuring AI-powered demand forecasting, inventory optimization, and sales analytics. Built using FastAPI (Backend) and React + Vite (Frontend).

---

# 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

---

# 📌 Prerequisites

Make sure the following are installed:

- Python 3.8+
- Node.js (v18 or higher)
- npm
- MongoDB (running locally)

Default MongoDB URL:

```bash
mongodb://localhost:27017
```

---

# 🛠️ Backend Setup (FastAPI)

## 1. Navigate to Backend Folder

```bash
cd backend
```

## 2. Create Virtual Environment

```bash
python -m venv venv
```

## 3. Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

## 5. Run Backend Server

```bash
python -m uvicorn main:app --reload
```

Backend will run at:

```bash
http://127.0.0.1:8000
```

---

# 💻 Frontend Setup (React + Vite)

Open a new terminal.

## 1. Navigate to Frontend Folder

```bash
cd frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Run Frontend Development Server

```bash
npm run dev
```

Frontend will run at:

```bash
http://localhost:5173
```

---

# 📂 Project Structure

```bash
Retail-Dashboard/
│
├── backend/
│   ├── main.py
│   ├── ml_engine.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 📊 Database Configuration

Create a `.env` file inside the `backend/` folder:

```env
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=retail_dashboard
```

---

# ✨ Key Features

## 📈 AI Demand Forecasting
- Hybrid forecasting model using Facebook Prophet and XGBoost
- Predictive sales and inventory analytics

## 📊 Dynamic Dashboard
- Real-time KPI tracking
- Inventory monitoring
- Product movement analytics

## 🔄 Smart Data Adapter
- Supports multiple retail CSV formats
- Automatic column mapping

## 💱 Currency Intelligence
- Detects USD ($)
- Converts values to INR (₹) automatically

## 👥 Team Hub
- Displays contributors
- Shows development roles

## 📦 Inventory Planning
- AI-based reorder recommendations
- Safety stock analysis
- Inventory risk prediction

---

# 📝 Usage Guide

## 🔐 Login
- Use default credentials
- Or create a new account

## 📤 Upload Data
Go to the `Data Upload` section.

Features:
- CSV upload support
- Automatic currency handling
- USD to INR conversion

## 🤖 Forecast Models
Navigate to `Forecast Models`.

View:
- Product demand predictions
- Sales forecasting analytics

## 👥 Team Section
Visit the `Team` page to see:
- Contributors
- Development roles

## 📦 Inventory Plan
Go to `Inventory Plan`.

Check:
- Suggested reorder quantities
- Inventory risk levels
- AI recommendations

---

# ⚡ Tech Stack

## Backend
- FastAPI
- Python
- Prophet
- XGBoost
- MongoDB

## Frontend
- React
- Vite
- Tailwind CSS
- Recharts

---

# 📌 Future Enhancements

- Multi-store inventory support
- Live sales tracking
- Advanced analytics reports
- Email notifications for stock alerts
- Cloud deployment support

---

# 👨‍💻 Contributors

Developed as part of an AI-powered retail analytics project.

Feel free to contribute and improve the system.
