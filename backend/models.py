"""Modelos v0.1 - Solo Product para el esqueleto. Ventas/Gastos llegan en v0.2/v0.3."""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    # panaderia | pasteleria | minimarket
    categoria = db.Column(db.String(30), nullable=False, default="panaderia")
    precio = db.Column(db.Integer, nullable=False, default=0)  # CLP sin decimales
    stock = db.Column(db.Integer, nullable=False, default=0)
    stock_min = db.Column(db.Integer, nullable=False, default=5)
    descripcion = db.Column(db.String(255), default="")
    foto_url = db.Column(db.String(255), default="")
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "categoria": self.categoria,
            "precio": self.precio,
            "stock": self.stock,
            "stock_min": self.stock_min,
            "descripcion": self.descripcion,
            "foto_url": self.foto_url,
            "activo": bool(self.activo),
            "stock_bajo": (self.stock or 0) <= (self.stock_min or 5),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
