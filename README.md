# AutoWorth AI 🚗

> **AI-Powered Vehicle Valuation & Market Intelligence Platform**
>
> *Predict. Compare. Understand. Decide.*

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

## Quick Start

### Prerequisites
- Docker Desktop
- Docker Compose v2

### 1. Clone and configure
```bash
git clone https://github.com/yourorg/autoworth-ai.git
cd autoworth-ai
cp .env.example .env
# Edit .env with your own secrets
```

### 2. Generate dataset + train model (first time only)
```bash
# Run inside the backend container after it starts
docker compose exec backend python /app/scripts/generate_dataset.py
docker compose exec backend python /app/scripts/train_model.py
```

### 3. Start the full stack
```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| pgAdmin | http://localhost:5050 (debug profile) |

### 4. Run tests
```bash
docker compose exec backend pytest /app/tests/ -v
```

---

## Project Structure

```
AutoWorth-AI/
├── frontend/          # React + TypeScript application
├── backend/           # FastAPI application
├── ml/                # Shared ML utilities
├── scripts/           # Data generation + model training
├── data/              # Dataset storage (gitignored)
├── models/            # Trained model artifacts (gitignored)
├── tests/             # Backend test suite
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ML Pipeline

1. **Data Generation** — `scripts/generate_dataset.py`  
   Generates 100K+ realistic synthetic vehicle records with meaningful correlations.

2. **Data Validation** — `scripts/validate_dataset.py`  
   Checks for missing values, duplicates, outliers, and invalid ranges.

3. **Feature Engineering** — `ml/feature_engineering.py`  
   Creates derived features: `km_per_year`, `age_mileage_interaction`, `brand_segment`, etc.

4. **Model Training** — `scripts/train_model.py`  
   Trains 6 models (Linear Regression → CatBoost), selects best by RMSE, saves artifact.

5. **Explainability** — SHAP values for every prediction.

6. **Prediction Intervals** — Conformal prediction for calibrated uncertainty bounds.

---

> ⚠️ **Disclaimer**: All vehicle valuations are based on synthetic training data for demonstration purposes. Not for real financial decisions.

---

## License

MIT License — see [LICENSE](LICENSE)
"# Autoworth_AI" 
