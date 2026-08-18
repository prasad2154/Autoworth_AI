"""
AutoWorth AI — Auth Service
Business logic for registration, login, password management.
"""
from datetime import datetime, timedelta, timezone
import secrets
from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..models import User, UserRole
from ..config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, full_name: str, email: str, password: str, role: UserRole = UserRole.USER) -> User:
    user = User(
        full_name=full_name,
        email=email.lower(),
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def set_reset_token(db: Session, user: User) -> str:
    token = generate_reset_token()
    user.reset_token = token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.RESET_TOKEN_EXPIRE_MINUTES
    )
    db.commit()
    return token


def verify_reset_token(db: Session, token: str) -> Optional[User]:
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        return None
    if user.reset_token_expires and user.reset_token_expires < datetime.now(timezone.utc):
        return None
    return user


def reset_password(db: Session, user: User, new_password: str) -> None:
    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()


def update_profile(db: Session, user: User, full_name: Optional[str], profile_image: Optional[str]) -> User:
    if full_name:
        user.full_name = full_name
    if profile_image is not None:
        user.profile_image = profile_image
    db.commit()
    db.refresh(user)
    return user


def seed_admin(db: Session) -> None:
    """Create admin user if not exists (called at startup)."""
    existing = get_user_by_email(db, settings.ADMIN_EMAIL)
    if not existing:
        create_user(
            db,
            full_name="AutoWorth Admin",
            email=settings.ADMIN_EMAIL,
            password=settings.ADMIN_PASSWORD,
            role=UserRole.ADMIN,
        )
