#!/bin/sh
# Entrada del contenedor backend: inicializa la DB una sola vez y luego inicia gunicorn.
set -e
export SKIP_INIT=1
python init_db.py
exec gunicorn --bind "0.0.0.0:${PORT:-5000}" --workers 2 --timeout 60 wsgi:app
