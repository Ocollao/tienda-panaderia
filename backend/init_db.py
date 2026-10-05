"""Inicializa la base de datos una sola vez (tablas + datos iniciales).

Lo ejecuta el entrypoint de Docker antes de iniciar gunicorn, para evitar
que varios workers intenten crear las tablas al mismo tiempo. Reintenta la
conexion porque Postgres puede tardar unos segundos en estar disponible.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, init_base_datos
from models import db

ESPERA_MAX = int(os.getenv("DB_ESPERA_MAX", "60"))


def main() -> None:
    os.environ["SKIP_INIT"] = "1"
    app = create_app()
    inicio = time.time()
    while True:
        try:
            with app.app_context():
                db.session.execute(db.text("SELECT 1"))
                init_base_datos(app)
            print("[init_db] base de datos lista.")
            return
        except Exception as e:  # la DB aun no responde: espera y reintenta
            if time.time() - inicio > ESPERA_MAX:
                print(f"[init_db] no se pudo conectar en {ESPERA_MAX}s: {e}")
                raise
            print(f"[init_db] esperando la base de datos... ({e})")
            time.sleep(2)


if __name__ == "__main__":
    main()
