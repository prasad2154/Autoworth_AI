"""
AutoWorth AI — Application settings
Reads from .env via pydantic-settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://autoworth_user:autoworth_pass@localhost:5432/autoworth_db"

    # JWT
    JWT_SECRET_KEY: str = "change-me-dev-secret-key-32-chars-minimum"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # ML
    MODEL_PATH: str = "models/autoworth_model.pkl"
    PREPROCESSOR_PATH: str = "models/preprocessor.pkl"
    METADATA_PATH: str = "models/metadata.json"

    # App
    APP_ENV: str = "development"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8501,http://127.0.0.1:3000,http://127.0.0.1:5173,http://localhost"

    # Admin seed
    ADMIN_EMAIL: str = "admin@autoworth.ai"
    ADMIN_PASSWORD: str = "Admin@AutoWorth2024"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
