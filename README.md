# AutoWorth AI 🚗

> **AI-Powered Vehicle Valuation & Market Intelligence Platform**
>
> *Predict. Compare. Understand. Decide.*

[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white)](https://www.python.org)
[![React](https://img.shields.io/badge/React-18+-cyan?logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)

---

## 🎯 Overview

AutoWorth AI is a comprehensive machine learning platform for vehicle valuation. It combines advanced ML models, explainable AI (SHAP), and a modern full-stack interface to provide accurate, transparent vehicle price predictions backed by data-driven insights.

**Key Capabilities:**
- 🎯 Real-time vehicle price predictions
- 📊 Explainable predictions with SHAP values
- 🔮 Prediction intervals for uncertainty quantification
- 🏗️ Production-ready Docker deployment
- 🔐 JWT authentication & secure API

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy, Alembic, JWT |
| **Database** | PostgreSQL 16 |
| **ML** | Scikit-learn, XGBoost, CatBoost, SHAP, Pandas, NumPy |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (v24+)
- Docker Compose v2
- Git

### 1. Clone and Configure

```bash
git clone https://github.com/prasad2154/Autoworth_AI.git
cd Autoworth_AI
cp .env.example .env
# Edit .env with your own configuration values
```

### 2. Generate Dataset & Train Model (First Time Only)

```bash
# Start the containers
docker compose up --build

# In another terminal, run inside the backend container
docker compose exec backend python /app/scripts/generate_dataset.py
docker compose exec backend python /app/scripts/train_model.py
```

### 3. Access Services

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| pgAdmin | http://localhost:5050 (debug profile only) |

### 4. Run Tests

```bash
docker compose exec backend pytest /app/tests/ -v
```

---

## Project Structure

```
AutoWorth-AI/
├── frontend/              # React + TypeScript application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   └── schemas/
│   ├── scripts/
│   ├── tests/
│   └── requirements.txt
├── ml/                    # Shared ML utilities
│   ├── feature_engineering.py
│   └── model_utils.py
├── scripts/               # Data generation & training
│   ├── generate_dataset.py
│   ├── train_model.py
│   └── validate_dataset.py
├── data/                  # Dataset storage (gitignored)
├── models/                # Trained model artifacts (gitignored)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📊 ML Pipeline

### 1. Data Generation
**File:** `scripts/generate_dataset.py`
- Generates 100,000+ realistic synthetic vehicle records
- Includes meaningful correlations between features
- Covers diverse vehicle categories and price ranges

### 2. Data Validation
**File:** `scripts/validate_dataset.py`
- Checks for missing values and duplicates
- Detects outliers using statistical methods
- Validates feature value ranges

### 3. Feature Engineering
**File:** `ml/feature_engineering.py`
- Creates derived features: `km_per_year`, `age_mileage_interaction`, `brand_segment`
- Handles categorical encoding
- Normalizes numerical features

### 4. Model Training
**File:** `scripts/train_model.py`
- Trains 6 models: Linear Regression, Ridge, Lasso, Random Forest, XGBoost, CatBoost
- Selects best model by RMSE on validation set
- Saves model artifact as pickle file

### 5. Explainability
- SHAP (SHapley Additive exPlanations) values for every prediction
- Feature importance visualization
- Local explanations for individual predictions

### 6. Prediction Intervals
- Conformal prediction methodology
- Calibrated uncertainty bounds
- Adjustable confidence levels (90%, 95%, 99%)

---

## 🌐 API Endpoints

### Base URL: `http://localhost:8000/api/v1`

#### Authentication
- `POST /auth/register` — User registration
- `POST /auth/login` — User login
- `POST /auth/refresh` — Refresh token

#### Vehicle Valuation
- `POST /predict` — Get vehicle price prediction
- `GET /predict/{prediction_id}` — Retrieve past prediction
- `GET /predict/history` — User prediction history

#### Model Info
- `GET /models/info` — Get current model details
- `GET /models/features` — Get required input features

---

## 🎯 Features

### For Users
✅ **Instant Predictions** — Get vehicle valuations in seconds

✅ **Explainable AI** — Understand why prices are predicted

✅ **Prediction History** — Track all your valuations

✅ **Responsive UI** — Works on desktop, tablet, and mobile

### For Developers
✅ **RESTful API** — Clean, documented endpoints

✅ **Type Safety** — Full TypeScript & Python type hints

✅ **Modular Architecture** — Easy to extend and maintain

✅ **Docker Ready** — One-command deployment

---

## 📊 Input Features

The model takes the following **vehicle characteristics**:

| Feature | Type | Description | Example |
|---------|------|-------------|---------|
| Brand | Categorical | Vehicle manufacturer | Toyota, Honda, BMW |
| Model | Categorical | Model name | Camry, Civic, 3 Series |
| Year | Numeric | Manufacturing year | 2015-2024 |
| Mileage | Numeric | Distance driven (km) | 0-250,000 |
| Engine Size | Numeric | Engine displacement (cc) | 800-5000 |
| Fuel Type | Categorical | Petrol, Diesel, Hybrid, EV | Petrol |
| Transmission | Categorical | Manual, Automatic | Automatic |
| Owner Count | Numeric | Number of previous owners | 1-5 |

---

## 📈 Model Performance

- **RMSE:** ₹85,000 - ₹120,000 (depending on dataset)
- **R² Score:** 0.89 - 0.94
- **MAE:** ₹65,000 - ₹95,000
- **Inference Time:** <500ms per prediction

---

## 🛠️ Development Setup

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 📝 Configuration

### Environment Variables (.env)

```dotenv
# Database
DATABASE_URL=postgresql://user:password@db:5432/autoworth

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# ML Models
MODEL_PATH=models/autoworth_model.pkl
PREPROCESSOR_PATH=models/preprocessor.pkl

# App
APP_ENV=production
CORS_ORIGINS=https://yourdomain.com
```

---

## 🔒 Security

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ SQL injection prevention (via SQLAlchemy)
- ✅ Rate limiting on API endpoints
- ✅ HTTPS support (in production)

---

## 📦 Deployment

### Production Deployment (Heroku)
```bash
# Login to Heroku
heroku login

# Create app
heroku create autoworth-ai

# Deploy
git push heroku main
```

### AWS Deployment (ECS)
- Containerized with Docker
- Managed PostgreSQL (RDS)
- Load balancing with ALB
- Auto-scaling configuration

---

## 🧪 Testing

```bash
# Run all tests
docker compose exec backend pytest tests/ -v

# Run specific test file
docker compose exec backend pytest tests/test_predictions.py -v

# Run with coverage
docker compose exec backend pytest --cov=app tests/
```

---

## 📚 Documentation

- **API Docs:** http://localhost:8000/docs (Interactive Swagger UI)
- **ReDoc:** http://localhost:8000/redoc (Alternative API documentation)
- **Architecture:** See `docs/ARCHITECTURE.md`
- **Contributing:** See `CONTRIBUTING.md`

---

## 🚨 Disclaimer

> ⚠️ **Important:** All vehicle valuations are based on synthetic training data for demonstration purposes only. This model should NOT be used for actual financial, investment, or commercial decisions. Always use professional valuators and market research for real-world applications.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- **FastAPI** for the excellent backend framework
- **React** for the powerful frontend library
- **SHAP** for explainable AI tools
- **Scikit-learn ecosystem** for ML algorithms
- Training mentor and AI course (G_38)

---

## 📞 Support

Have questions or issues? Reach out:
- 📧 Email: [your-email@example.com]
- 💬 GitHub Issues: [Create an issue](https://github.com/prasad2154/Autoworth_AI/issues)
- 💼 LinkedIn: [Connect](https://www.linkedin.com/in/prasad-sharma)

---

<p align="center">
  <strong>🚗 AutoWorth AI — Intelligent Vehicle Valuation</strong><br>
  Built with ❤️ using FastAPI, React & Machine Learning<br>
  © 2026 • All Rights Reserved
</p>

**Last Updated:** 2026 | Star ⭐ if you find this helpful!
