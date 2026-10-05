"""API ventas y boletas v0.2."""
from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from models import db, Product, Sale, SaleItem

sales_bp = Blueprint("sales", __name__)
MEDIOS = ("efectivo", "tarjeta", "transferencia")


def _parse_fecha(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


@sales_bp.post("/api/sales")
def crear_venta():
    """Crea boleta: descuenta stock en una transaccion. Precio se toma de la BD."""
    data = request.get_json(force=True, silent=True) or {}
    items = data.get("items") or []
    if not items:
        return jsonify({"error": "la venta necesita al menos 1 producto"}), 400
    medio = (data.get("medio_pago") or "efectivo").lower()
    if medio not in MEDIOS:
        return jsonify({"error": f"medio_pago debe ser uno de {list(MEDIOS)}"}), 400

    try:
        venta = Sale(medio_pago=medio, vendedor=(data.get("vendedor") or "")[:80], total=0, folio="tmp")
        db.session.add(venta)
        db.session.flush()  # obtiene id para el folio
        venta.folio = f"B-{venta.id:06d}"

        total = 0
        for it in items:
            try:
                pid = int(it.get("product_id"))
                cant = int(it.get("cantidad", 0))
            except (ValueError, TypeError):
                raise ValueError("product_id y cantidad deben ser numeros")
            if cant <= 0:
                raise ValueError("cantidad debe ser mayor a 0")
            prod = db.session.get(Product, pid)
            if not prod or not prod.activo:
                raise ValueError(f"producto {pid} no existe o esta inactivo")
            if prod.stock < cant:
                raise ValueError(f"stock insuficiente: {prod.nombre} (queda {prod.stock})")
            prod.stock -= cant
            sub = prod.precio * cant
            total += sub
            db.session.add(SaleItem(sale_id=venta.id, product_id=pid, cantidad=cant,
                                   precio_unit=prod.precio, subtotal=sub))
        venta.total = total
        db.session.commit()
        venta = db.session.get(Sale, venta.id)
        return jsonify(venta.to_dict(con_detalle=True)), 201
    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"no se pudo guardar: {str(e)[:200]}"}), 500


@sales_bp.get("/api/sales")
def listar_ventas():
    """Lista boletas (sin detalle) con filtro opcional ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD."""
    desde = _parse_fecha(request.args.get("desde"))
    hasta = _parse_fecha(request.args.get("hasta"))
    q = Sale.query
    if desde:
        q = q.filter(Sale.fecha >= datetime.combine(desde, datetime.min.time()))
    if hasta:
        q = q.filter(Sale.fecha < datetime.combine(hasta + timedelta(days=1), datetime.min.time()))
    ventas = q.order_by(Sale.id.desc()).limit(500).all()
    return jsonify([v.to_dict() for v in ventas])


@sales_bp.get("/api/sales/<int:sid>")
def detalle_venta(sid):
    v = db.get_or_404(Sale, sid)
    return jsonify(v.to_dict(con_detalle=True))


@sales_bp.get("/api/sales/resumen")
def resumen():
    """Resumen para boletas/dashboard: hoy, ultimos 7 dias y rango opcional."""
    desde = _parse_fecha(request.args.get("desde"))
    hasta = _parse_fecha(request.args.get("hasta"))
    hoy = date.today()

    def _tot(d0, d1):
        q = db.session.query(func.count(Sale.id), func.coalesce(func.sum(Sale.total), 0)).filter(
            Sale.fecha >= datetime.combine(d0, datetime.min.time()),
            Sale.fecha < datetime.combine(d1 + timedelta(days=1), datetime.min.time()))
        n, t = q.one()
        return {"n_boletas": n or 0, "total": t or 0,
                "ticket_promedio": round((t or 0) / n) if n else 0}

    rango = _tot(desde or (hoy - timedelta(days=29)), hasta or hoy) if (desde or hasta) else None
    return jsonify({
        "hoy": _tot(hoy, hoy),
        "ultimos_7_dias": _tot(hoy - timedelta(days=6), hoy),
        "rango": rango,
        "rango_desde": (desde or (hoy - timedelta(days=29))).isoformat() if rango else None,
        "rango_hasta": (hasta or hoy).isoformat() if rango else None,
    })
