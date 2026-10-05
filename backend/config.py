"""Configuracion v0.4 - SQLite (rápido) / MySQL-Dolphin / Postgres (deploy)."""
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


def get_database_uri() -> str:
    engine = os.getenv("DB_ENGINE", "sqlite").lower()
    if engine == "mysql":
        host = os.getenv("MYSQL_HOST", "127.0.0.1")
        port = os.getenv("MYSQL_PORT", "3306")
        db = os.getenv("MYSQL_DB", "tienda_panaderia")
        user = os.getenv("MYSQL_USER", "root")
        pw = os.getenv("MYSQL_PASS", "root")
        # pymysql es el driver para MySQL
        return f"mysql+pymysql://{user}:{pw}@{host}:{port}/{db}?charset=utf8mb4"
    if engine in ("postgres", "postgresql"):
        # v0.4: Postgres para deploy (docker-compose trae uno listo).
        # Acepta DATABASE_URL completa o partes PG_*.
        url = os.getenv("DATABASE_URL", "").strip()
        if url:
            # Render/Fly entregan postgres:// ; SQLAlchemy prefiere postgresql://
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url
        host = os.getenv("PG_HOST", "127.0.0.1")
        port = os.getenv("PG_PORT", "5432")
        db = os.getenv("PG_DB", "tienda_panaderia")
        user = os.getenv("PG_USER", "tienda")
        pw = os.getenv("PG_PASS", "tienda123")
        return f"postgresql+psycopg2://{user}:{pw}@{host}:{port}/{db}"
    # Fallback rápido: SQLite (no requiere instalar nada)
    base = os.path.dirname(__file__)
    return f"sqlite:///{os.path.join(base, 'tienda.db')}"


def get_cors_origins():
    raw = os.getenv("FRONTEND_ORIGIN", "*").strip()
    if raw == "*":
        return "*"
    return [o.strip() for o in raw.split(",") if o.strip()]


class Config:
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # v0.4: pool chico para Postgres deploy + sqlite sin drama
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_size": 5, "max_overflow": 5}
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB por foto
    ALLOWED_EXT = {"png", "jpg", "jpeg", "webp", "gif"}
    SECRET_KEY = os.getenv("SECRET_KEY", "espiga-dev-2026")
