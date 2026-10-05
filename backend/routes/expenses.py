"""API gastos v0.3."""
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from models import db, Expense

expenses_bp = Blueprint("expenses", __name__)
CATEGORIAS = ("insumos", "sueldos", "arriendo", "servicios", "otros")


def _parse_fecha(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _validar(data, parcial=False):
    errores = []
    if not parcial or "concepto" in data:
        if not (data.get("concepto") or "").strip():
            errores.append("concepto es obligatorio")
    if not parcial or "categoria" in data:
        if data.get("categoria") not in CATEGORIAS:
            errores.append(f"categoria debe ser una de {list(CATEGORIAS)}")
    if "monto" in data or not parcial:
        try:
            if int(data.get("monto", 0)) <= 0:
                errores.append("monto debe ser mayor a 0 (CLP)")
        except (ValueError, TypeError):
            errores.append("monto debe ser numero entero CLP")
    return errores


@expenses_bp.get("/api/expenses")
def listar():
    """Lista gastos con filtros ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&categoria=insumos."""
    desde = _parse_fecha(request.args.get("desde"))
    hasta = _parse_fecha(request.args.get("hasta"))
    categoria = request.args.get("categoria", "")
    q = Expense.query
    if desde:
        q = q.filter(Expense.fecha >= datetime.combine(desde, datetime.min.time()))
    if hasta:
        q = q.filter(Expense.fecha < datetime.combine(hasta + timedelta(days=1), datetime.min.time()))
    if categoria in CATEGORIAS:
        q = q.filter_by(categoria=categoria)
    gastos = q.order_by(Expense.fecha.desc(), Expense.id.desc()).limit(500).all()
    return jsonify([g.to_dict() for g in gastos])


@expenses_bp.post("/api/expenses")
def crear():
    data = request.get_json(force=True, silent=True) or {}
    errores = _validar(data)
    if errores:
        return jsonify({"errores": errores}), 400
    fecha = datetime.utcnow()
    if data.get("fecha"):
        f = _parse_fecha(data.get("fecha"))
        if not f:
            return jsonify({"errores": ["fecha debe ser YYYY-MM-DD"]}), 400
        fecha = datetime.combine(f, datetime.now().time())
    g = Expense(
        concepto=data["concepto"].strip(),
        categoria=data["categoria"],
        monto=int(data["monto"]),
        fecha=fecha,
        nota=(data.get("nota") or "")[:255],
        responsable=(data.get("responsable") or "")[:80],
    )
    db.session.add(g)
    db.session.commit()
    return jsonify(g.to_dict()), 201


@expenses_bp.put("/api/expenses/<int:gid>")
def actualizar(gid):
    g = Expense.query.get_or_404(gid)
    data = request.get_json(force=True, silent=True) or {}
    errores = _validar(data, parcial=True)
    if errores:
        return jsonify({"errores": errores}), 400
    if "concepto" in data:
        g.concepto = data["concepto"].strip()
    if "categoria" in data:
        g.categoria = data["categoria"]
    if "monto" in data:
        g.monto = int(data["monto"])
    if "nota" in data:
        g.nota = (data.get("nota") or "")[:255]
    if "responsable" in data:
        g.responsable = (data.get("responsable") or "")[:80]
    if data.get("fecha"):
        f = _parse_fecha(data.get("fecha"))
        if not f:
            return jsonify({"errores": ["fecha debe ser YYYY-MM-DD"]}), 400
        g.fecha = datetime.combine(f, g.fecha.time() if g.fecha else datetime.now().time())
    db.session.commit()
    return jsonify(g.to_dict())


@expenses_bp.delete("/api/expenses/<int:gid>")
def eliminar(gid):
    g = Expense.query.get_or_404(gid)
    db.session.delete(g)
    db.session.commit()
    return jsonify({"ok": True, "id": gid})


@expenses_bp.get("/api/expenses/resumen")
def resumen():
    """Resumen de gastos: total + por categoria en rango ?desde&hasta."""
    desde = _parse_fecha(request.args.get("desde"))
    hasta = _parse_fecha(request.args.get("hasta"))
    q = Expense.query
    if desde:
        q = q.filter(Expense.fecha >= datetime.combine(desde, datetime.min.time()))
    if hasta:
        q = q.filter(Expense.fecha < datetime.combine(hasta + timedelta(days=1), datetime.min.time()))
    gastos = q.all()
    total = sum(g.monto for g in gastos)
    por_cat = {}
    for g in gastos:
        por_cat.setdefault(g.categoria, {"categoria": g.categoria, "total": 0, "n": 0})
        por_cat[g.categoria]["total"] += g.monto
        por_cat[g.categoria]["n"] += 1
    return jsonify({
        "total": total,
        "n_gastos": len(gastos),
        "ticket_promedio": round(total / len(gastos)) if gastos else 0,
        "por_categoria": sorted(por_cat.values(), key=lambda x: x["total"], reverse=True),
    })
