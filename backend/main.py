"""
AutoWorth AI — FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import engine, SessionLocal, Base
from .models import *  # ensure models are registered
from .ml.model_loader import model_loader

# Import routers
from .routers import auth, users, prediction, vehicles, market, alerts, admin, saved_cars


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown lifecycle."""
    # ── Startup ──
    print("🚀 AutoWorth AI Backend starting...")

    # Create all tables (Alembic is preferred for prod, this is a fallback)
    Base.metadata.create_all(bind=engine)

    # Seed admin user
    db = SessionLocal()
    try:
        from .services.auth_service import seed_admin
        seed_admin(db)
    finally:
        db.close()

    # Load ML model
    model_loader.load()

    print("✅ AutoWorth AI Backend ready!")
    yield

    # ── Shutdown ──
    print("👋 AutoWorth AI Backend shutting down...")


app = FastAPI(
    title="AutoWorth AI",
    description="AI-Powered Vehicle Valuation & Market Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)
app.include_router(prediction.router, prefix=PREFIX)
app.include_router(vehicles.router, prefix=PREFIX)
app.include_router(market.router, prefix=PREFIX)
app.include_router(alerts.router, prefix=PREFIX)
app.include_router(admin.router, prefix=PREFIX)
app.include_router(saved_cars.router, prefix=PREFIX)


# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/api/v1/health", tags=["System"])
def health_check():
    return JSONResponse({
        "status": "healthy",
        "service": "AutoWorth AI Backend",
        "version": "1.0.0",
        "model_loaded": model_loader.is_ready,
        "model_version": model_loader.metadata.get("version") if model_loader.is_ready else None,
    })


@app.get("/", tags=["System"])
def root():
    return {
        "message": "AutoWorth AI — AI-Powered Vehicle Valuation API",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
