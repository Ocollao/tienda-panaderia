"""API auth simple v0.4: login + gestion de usuarios (dueno/vendedor)."""
from flask import Blueprint, request, jsonify
from models import db, User, ROLES

auth_bp = Blueprint("auth", __name__)


def _es_dueno(data) -> bool:
    """En v0.4 simple: las acciones de dueno se autorizan con header X-ROL=dueno + X-USER existente y activo."""
    if (request.headers.get("X-ROL") or "").lower() != "dueno":
        return False
    username = request.headers.get("X-USER") or (data.get("solicitado_por") if isinstance(data, dict) else None) or ""
    if not username:
        return False
    u = User.query.filter_by(username=username, activo=True).first()
    return bool(u and u.rol == "dueno")


@auth_bp.post("/api/auth/login")
def login():
    data = request.get_json(force=True, silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    if not username or not password:
        return jsonify({"error": "Envía el nombre de usuario y la contraseña."}), 400
    u = User.query.filter_by(username=username).first()
    if not u or not u.activo:
        return jsonify({"error": "El usuario no existe o está desactivado."}), 401
    if not u.check_password(password):
        return jsonify({"error": "Contraseña incorrecta, intenta de nuevo."}), 401
    return jsonify({"ok": True, "user": u.to_dict()})


@auth_bp.post("/api/auth/register")
def register():
    """Crea usuario. El primero del sistema se crea libre (bootstrap dueno).
    Despues solo un dueno (headers X-USER/X-ROL) puede crear."""
    data = request.get_json(force=True, silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    rol = (data.get("rol") or "vendedor").lower()
    if not username or not password:
        return jsonify({"error": "El nombre de usuario y la contraseña son obligatorios."}), 400
    if rol not in ROLES:
        return jsonify({"error": f"El rol debe ser uno de {list(ROLES)}."}), 400
    if len(password) < 4:
        return jsonify({"error": "La contraseña debe tener al menos 4 caracteres."}), 400
    if User.query.count() > 0 and not _es_dueno(data):
        return jsonify({"error": "Solo el dueño puede crear usuarios (envía X-USER/X-ROL)."}), 403
    # El primer usuario siempre queda dueno aunque pidan vendedor
    if User.query.count() == 0:
        rol = "dueno"
    if User.query.filter_by(username=username).first():
        return jsonify({"error": f"El usuario '{username}' ya existe."}), 400
    u = User(username=username, rol=rol, activo=True)
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    return jsonify(u.to_dict()), 201


@auth_bp.get("/api/users")
def listar():
    users = User.query.order_by(User.id.asc()).all()
    return jsonify([u.to_dict() for u in users])


@auth_bp.put("/api/users/<int:uid>")
def actualizar(uid):
    """Solo dueno cambia rol/activo/clave."""
    data = request.get_json(force=True, silent=True) or {}
    if not _es_dueno(data):
        return jsonify({"error": "Solo el dueño puede editar usuarios."}), 403
    u = User.query.get_or_404(uid)
    if "rol" in data:
        if data["rol"] not in ROLES:
            return jsonify({"error": f"El rol debe ser uno de {list(ROLES)}."}), 400
        u.rol = data["rol"]
    if "activo" in data:
        u.activo = bool(data["activo"])
    if data.get("password"):
        if len(data["password"]) < 4:
            return jsonify({"error": "La contraseña debe tener al menos 4 caracteres."}), 400
        u.set_password(data["password"])
    db.session.commit()
    return jsonify(u.to_dict())
