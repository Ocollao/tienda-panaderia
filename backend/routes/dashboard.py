"""API dashboard dueño v0.3: ventas vs gastos vs utilidad."""
from collections import Counter, defaultdict
from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from models import db, Sale, SaleItem, Expense

dashboard_bp = Blueprint("dashboard", __name__)


def _parse_fecha(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


@dashboard_bp.get("/api/dashboard")
def dashboard():
    """Resumen dueño. ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD (defecto ultimos 30 dias)."""
    hoy = date.today()
    desde = _parse_fecha(request.args.get("desde")) or (hoy - timedelta(days=29))
    hasta = _parse_fecha(request.args.get("hasta")) or hoy
    if desde > hasta:
        desde, hasta = hasta, desde
    d0 = datetime.combine(desde, datetime.min.time())
    d1 = datetime.combine(hasta + timedelta(days=1), datetime.min.time())

    ventas = Sale.query.filter(Sale.fecha >= d0, Sale.fecha < d1).all()
    gastos = Expense.query.filter(Expense.fecha >= d0, Expense.fecha < d1).all()

    ventas_total = sum(v.total for v in ventas)
    gastos_total = sum(g.monto for g in gastos)
    utilidad = ventas_total - gastos_total
    margen = round(utilidad * 100 / ventas_total, 1) if ventas_total else 0.0

    # Ventas por medio de pago
    por_medio = Counter()
    por_medio_n = Counter()
    for v in ventas:
        por_medio[v.medio_pago or "efectivo"] += v.total
        por_medio_n[v.medio_pago or "efectivo"] += 1
    medios = [{"medio_pago": k, "total": por_medio[k], "n": por_medio_n[k]} for k in por_medio]

    # Gastos por categoria
    por_cat = defaultdict(lambda: {"total": 0, "n": 0})
    for g in gastos:
        por_cat[g.categoria]["total"] += g.monto
        por_cat[g.categoria]["n"] += 1
    gastos_cat = [{"categoria": k, **v} for k, v in sorted(por_cat.items(), key=lambda x: x[1]["total"], reverse=True)]

    # Top productos (cantidad + total) en el rango
    sale_ids = [v.id for v in ventas]
    top = []
    if sale_ids:
        items = SaleItem.query.filter(SaleItem.sale_id.in_(sale_ids)).all()
        agg = defaultdict(lambda: {"cantidad": 0, "total": 0, "nombre": "?"})
        for it in items:
            a = agg[it.product_id]
            a["cantidad"] += it.cantidad
            a["total"] += it.subtotal
            a["nombre"] = it.product.nombre if it.product else "?"
        top = sorted(
            ({"product_id": pid, **v} for pid, v in agg.items()),
            key=lambda x: x["total"], reverse=True)[:5]

    # Ventas y gastos por dia (para grafico simple de barras/tabla)
    por_dia_v = defaultdict(lambda: {"total": 0, "n": 0})
    for v in ventas:
        key = v.fecha.date().isoformat() if v.fecha else hasta.isoformat()
        por_dia_v[key]["total"] += v.total
        por_dia_v[key]["n"] += 1
    por_dia_g = defaultdict(int)
    for g in gastos:
        key = g.fecha.date().isoformat() if g.fecha else hasta.isoformat()
        por_dia_g[key] += g.monto
    dias = []
    cur = desde
    while cur <= hasta:
        k = cur.isoformat()
        dias.append({
            "fecha": k,
            "ventas": por_dia_v[k]["total"] if k in por_dia_v else 0,
            "n_boletas": por_dia_v[k]["n"] if k in por_dia_v else 0,
            "gastos": por_dia_g.get(k, 0),
        })
        cur += timedelta(days=1)

    return jsonify({
        "desde": desde.isoformat(),
        "hasta": hasta.isoformat(),
        "ventas": {
            "total": ventas_total,
            "n_boletas": len(ventas),
            "ticket_promedio": round(ventas_total / len(ventas)) if ventas else 0,
        },
        "gastos": {
            "total": gastos_total,
            "n_gastos": len(gastos),
            "ticket_promedio": round(gastos_total / len(gastos)) if gastos else 0,
        },
        "utilidad": utilidad,
        "margen_pct": margen,
        "por_medio_pago": medios,
        "gastos_por_categoria": gastos_cat,
        "top_productos": top,
        "por_dia": dias,
    })
