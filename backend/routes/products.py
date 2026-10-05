"""CRUD productos + subida de fotos v0.4 (con alerta stock bajo)."""
import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from models import db, Product

products_bp = Blueprint("products", __name__)


def _validar(data, parcial=False):
    errores = []
    if not parcial or "nombre" in data:
        if not (data.get("nombre") or "").strip():
            errores.append("nombre es obligatorio")
    if not parcial or "categoria" in data:
        if data.get("categoria") not in ("panaderia", "pasteleria", "minimarket"):
            errores.append("categoria debe ser panaderia|pasteleria|minimarket")
    if "precio" in data:
        try:
            if int(data["precio"]) < 0:
                errores.append("precio no puede ser negativo")
        except (ValueError, TypeError):
            errores.append("precio debe ser numero entero CLP")
    if "stock" in data:
        try:
            if int(data["stock"]) < 0:
                errores.append("stock no puede ser negativo")
        except (ValueError, TypeError):
            errores.append("stock debe ser numero entero")
    return errores


@products_bp.get("/api/products")
def listar():
    categoria = request.args.get("categoria", "")
    q = request.args.get("q", "").strip()
    query = Product.query.filter_by(activo=True)
    if categoria in ("panaderia", "pasteleria", "minimarket"):
        query = query.filter_by(categoria=categoria)
    if q:
        query = query.filter(Product.nombre.ilike(f"%{q}%"))
    prods = query.order_by(Product.id.desc()).all()
    return jsonify([p.to_dict() for p in prods])


@products_bp.get("/api/products/<int:pid>")
def obtener(pid):
    p = Product.query.get_or_404(pid)
    return jsonify(p.to_dict())


@products_bp.get("/api/products/low-stock")
def stock_bajo():
    """v0.4 Alerta stock bajo: productos con stock <= stock_min (solo activos)."""
    prods = Product.query.filter_by(activo=True).all()
    bajos = [p for p in prods if (p.stock or 0) <= (p.stock_min if p.stock_min is not None else 5)]
    bajos.sort(key=lambda p: ((p.stock or 0) - (p.stock_min or 5)))
    return jsonify({
        "total": len(bajos),
        "productos": [p.to_dict() for p in bajos],
    })


@products_bp.post("/api/products")
def crear():
    data = request.get_json(force=True, silent=True) or {}
    errores = _validar(data)
    if errores:
        return jsonify({"errores": errores}), 400
    p = Product(
        nombre=data["nombre"].strip(),
        categoria=data["categoria"],
        precio=int(data.get("precio", 0)),
        stock=int(data.get("stock", 0)),
        stock_min=int(data.get("stock_min", 5)),
        descripcion=(data.get("descripcion") or "")[:255],
        foto_url=(data.get("foto_url") or "")[:255],
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201


@products_bp.put("/api/products/<int:pid>")
def actualizar(pid):
    p = Product.query.get_or_404(pid)
    data = request.get_json(force=True, silent=True) or {}
    errores = _validar(data, parcial=True)
    if errores:
        return jsonify({"errores": errores}), 400
    for campo in ("nombre", "categoria", "descripcion", "foto_url"):
        if campo in data:
            setattr(p, campo, data[campo])
    for campo in ("precio", "stock", "stock_min"):
        if campo in data:
            setattr(p, campo, int(data[campo]))
    if "activo" in data:
        p.activo = bool(data["activo"])
    db.session.commit()
    return jsonify(p.to_dict())


@products_bp.delete("/api/products/<int:pid>")
def eliminar(pid):
    # Borrado logico para no romper boletas futuras (v0.2)
    p = Product.query.get_or_404(pid)
    p.activo = False
    db.session.commit()
    return jsonify({"ok": True, "id": pid})


@products_bp.post("/api/upload")
def subir_foto():
    if "foto" not in request.files:
        return jsonify({"error": "envia el archivo como 'foto'"}), 400
    f = request.files["foto"]
    if not f.filename:
        return jsonify({"error": "archivo sin nombre"}), 400
    ext = f.filename.rsplit(".", 1)[-1].lower()
    if ext not in current_app.config["ALLOWED_EXT"]:
        return jsonify({"error": f"extension no permitida: {ext}"}), 400
    nombre = f"{uuid.uuid4().hex[:8]}_{secure_filename(f.filename)}"
    destino = os.path.join(current_app.config["UPLOAD_FOLDER"], nombre)
    os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
    f.save(destino)
    return jsonify({"foto_url": f"/uploads/{nombre}"}), 201
