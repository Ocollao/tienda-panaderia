"""Modelos v0.3 - Product + Sale/SaleItem + Expense (gastos)."""
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


class Sale(db.Model):
    """v0.2 Boleta/venta cabecera."""
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)
    folio = db.Column(db.String(20), unique=True, default="")
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    total = db.Column(db.Integer, nullable=False, default=0)  # CLP
    medio_pago = db.Column(db.String(30), default="efectivo")  # efectivo|tarjeta|transferencia
    vendedor = db.Column(db.String(80), default="")
    items = db.relationship("SaleItem", backref="sale", cascade="all, delete-orphan", lazy=True)

    def to_dict(self, con_detalle=False):
        d = {
            "id": self.id,
            "folio": self.folio,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "total": self.total,
            "medio_pago": self.medio_pago,
            "vendedor": self.vendedor,
            "n_items": len(self.items) if self.items is not None else 0,
        }
        if con_detalle:
            d["items"] = [it.to_dict() for it in self.items]
        return d


class SaleItem(db.Model):
    """v0.2 Linea de boleta."""
    __tablename__ = "sale_items"

    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey("sales.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False, default=1)
    precio_unit = db.Column(db.Integer, nullable=False, default=0)  # precio al vender
    subtotal = db.Column(db.Integer, nullable=False, default=0)
    product = db.relationship("Product", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "nombre": self.product.nombre if self.product else "?",
            "cantidad": self.cantidad,
            "precio_unit": self.precio_unit,
            "subtotal": self.subtotal,
        }


class Expense(db.Model):
    """v0.3 Gasto del negocio (dueño)."""
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    concepto = db.Column(db.String(120), nullable=False)
    # insumos | sueldos | arriendo | servicios | otros
    categoria = db.Column(db.String(30), nullable=False, default="insumos")
    monto = db.Column(db.Integer, nullable=False, default=0)  # CLP sin decimales
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    nota = db.Column(db.String(255), default="")
    responsable = db.Column(db.String(80), default="")

    def to_dict(self):
        return {
            "id": self.id,
            "concepto": self.concepto,
            "categoria": self.categoria,
            "monto": self.monto,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "nota": self.nota or "",
            "responsable": self.responsable or "",
        }
