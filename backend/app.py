"""App Flask v0.4 - Ventas, boletas, gastos, dashboard, roles y stock bajo."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config, get_cors_origins
from models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": get_cors_origins()}})
    db.init_app(app)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    from routes.products import products_bp
    from routes.sales import sales_bp
    from routes.expenses import expenses_bp
    from routes.dashboard import dashboard_bp
    from routes.auth import auth_bp
    app.register_blueprint(products_bp)
    app.register_blueprint(sales_bp)
    app.register_blueprint(expenses_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(auth_bp)

    @app.get("/api/health")
    def health():
        try:
            db.session.execute(db.text("SELECT 1"))
            return jsonify({"status": "ok", "db": "ok", "version": "0.4.1"})
        except Exception as e:  # muestra el error para depurar Dolphin/MySQL/Postgres rápido
            return jsonify({"status": "ok", "db": "error", "detalle": str(e)[:300]}), 500

    @app.get("/uploads/<path:fname>")
    def uploads(fname):
        return send_from_directory(app.config["UPLOAD_FOLDER"], fname)

    with app.app_context():
        # En despliegue (gunicorn con varios workers) la inicializacion la hace
        # init_db.py una sola vez desde el entrypoint. Aqui se omite con SKIP_INIT=1
        # para evitar que dos workers creen las tablas al mismo tiempo.
        if os.getenv("SKIP_INIT", "0") != "1":
            init_base_datos(app)

    return app


def init_base_datos(app=None):
    """Crea las tablas y carga los datos iniciales si las tablas estan vacias."""
    from models import Product, User
    db.create_all()  # crea products, sales, expenses y users si faltan
    # Seed automatico si esta vacia
    if Product.query.count() == 0:
        try:
            from seed import SEED
            for d in SEED:
                db.session.add(Product(**d))
            db.session.commit()
            print(f"[seed] {len(SEED)} productos chilenos cargados.")
        except Exception as e:
            db.session.rollback()
            print(f"[seed] omitido: {e}")
    # Usuarios iniciales (dueno + vendedor) si no hay ninguno
    if User.query.count() == 0:
        try:
            dueno = User(username=os.getenv("SEED_DUENO_USER", "dueno"), rol="dueno", activo=True)
            dueno.set_password(os.getenv("SEED_DUENO_PASS", "dueno123"))
            vende = User(username=os.getenv("SEED_VENDEDOR_USER", "vendedora"), rol="vendedor", activo=True)
            vende.set_password(os.getenv("SEED_VENDEDOR_PASS", "venta123"))
            db.session.add_all([dueno, vende])
            db.session.commit()
            print("[seed] usuarios dueno/vendedora creados.")
        except Exception as e:
            db.session.rollback()
            print(f"[seed users] omitido: {e}")


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
