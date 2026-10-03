"""Configuracion v0.1 - Elige MySQL (Dolphin) o SQLite por .env."""
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
    # Fallback rapido: SQLite (no requiere instalar nada)
    base = os.path.dirname(__file__)
    return f"sqlite:///{os.path.join(base, 'tienda.db')}"


class Config:
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB por foto
    ALLOWED_EXT = {"png", "jpg", "jpeg", "webp", "gif"}
