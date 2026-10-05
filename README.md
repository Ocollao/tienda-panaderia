# 🥖 La Espiga — Tienda Panadería / Pastelería / Minimarket `v0.4.1`

Proyecto simple, vistoso y responsive (móvil / tablet / web).

**Stack v0.4:** Python Flask (API) + Angular Material (frontend) + SQLite (rápido) / MySQL-Dolphin / Postgres (deploy con Docker).

## Estructura
```
backend/   -> Flask API + SQLite/MySQL/Postgres + fotos en uploads/ + wsgi.py + Dockerfile
frontend/  -> Angular 20 + Material (catálogo + inventario + ventas + boletas + gastos + dashboard + login + usuarios) + nginx.conf + Dockerfile
docker-compose.yml -> postgres + backend + frontend (todo junto)
VERSION / CHANGELOG.md
```

## Requisitos
Python 3.12 + Node 22 + Angular CLI 20. Para deploy: Docker + Docker Compose.

## 1) Backend (puerto 5000)
```powershell
cd backend
pip install -r requirements.txt
Copy-Item .env.example .env   # viene en sqlite; para Dolphin/MySQL o Postgres edita .env
python app.py
# test: http://127.0.0.1:5000/api/health  -> {"db":"ok","version":"0.4.1"}
# productos: http://127.0.0.1:5000/api/products
```

**Dolphin/MySQL rápido:**
1. Abre Dolphin, ejecuta `backend/schema.sql` (crea BD + tablas).
2. Ejecuta `backend/seed_chileno_2026.sql` (15 productos CLP 2026).
3. En `backend/.env` pon `DB_ENGINE=mysql` + tus credenciales y reinicia `python app.py`.

**Postgres local (sin Docker):**
1. Crea la BD `tienda_panaderia` en tu Postgres.
2. En `backend/.env` pon `DB_ENGINE=postgres` + `PG_HOST/PG_PORT/PG_DB/PG_USER/PG_PASS` (o `DATABASE_URL`).
3. Ejecuta `backend/schema.sql` adaptando `AUTO_INCREMENT` → `SERIAL` en `users` si la creas a mano (con SQLAlchemy se crea sola al partir).
4. Reinicia `python app.py` → se crean las tablas y los usuarios seed.

## 2) Frontend (puerto 4200)
```powershell
cd frontend
npm install
npx ng serve --open
# http://localhost:4200 -> te pide login primero
```
El frontend usa Flask directo en dev y `/api` relativo en Docker (ver `core/config/api.ts`).

## Usuarios y roles v0.4
Al partir el backend se crean solos (si la tabla está vacía):
- Dueño → `dueno / dueno123` (ve todo: gastos, dashboard, usuarios)
- Vendedora → `vendedora / venta123` (catálogo, inventario, ventas, boletas)

El vendedor no ve gastos/dashboard/usuarios (guard los manda al catálogo).

## Datos ejemplo chilenos 2026
Marraqueta, hallulla, pan amasado, empanada pino, torta mil hojas, kuchen, berlin, leche, bebida 3L, café, etc. con precios CLP 2026.

## Roadmap
- **v0.1 ✅** esqueleto + inventario CRUD + fotos + catálogo responsive
- **v0.2 ✅** ventas (carrito + cobrar) + boletas (detalle, resumen, impresión)
- **v0.3 ✅** gastos (CRUD + categorías) + dashboard dueño (ventas/gastos/utilidad, top productos, gráfico diario)
- **v0.4 ✅** roles (dueño/vendedor + login), stock bajo (alerta + reponer), Postgres, deploy Docker

## Probar v0.4
1. Entra como **dueno / dueno123** → vas al Dashboard.
2. En **Inventario**: si hay stock bajo sale banner ⚠️, filtra “solo bajos” y repone +10 con el botón.
3. En **Usuarios**: crea a “ana / ana123 / vendedor”, cámbiale el rol y desactívala.
4. Sal y entra como **vendedora / venta123** → no ves Gastos/Dashboard/Usuarios.
5. API: `POST /api/auth/login {"username":"dueno","password":"dueno123"}` ·
   `GET /api/products/low-stock` · `GET /api/dashboard` (trae `stock_bajo`).

## Deploy con Docker (todo junto) 🐳
```powershell
# desde la raíz del proyecto
docker compose up --build
# frontend: http://localhost:8080 (login ahí mismo)
# backend:  http://localhost:5000/api/health
# postgres: localhost:5432 (tienda/tienda123)
```
El compose levanta Postgres con volumen, el backend con gunicorn (seed de productos + usuarios automático) y el frontend con nginx que proxea `/api` y `/uploads` al backend.

## Deploy en Render/Fly (resumen)
- **Backend:** sube `backend/` como web service con `pip install -r requirements.txt` y arranque `gunicorn wsgi:app --bind 0.0.0.0:$PORT`. Pon `DB_ENGINE=postgres`, `DATABASE_URL` de tu Postgres, `FRONTEND_ORIGIN=https://tu-front.com` y `SECRET_KEY` firme.
- **Frontend:** publícalo como static con `npm ci && npx ng build --configuration production` sirviendo `dist/frontend/browser`, o usa el `frontend/Dockerfile` tal cual. Como el front usa `/api` relativo, deja el proxy o configura la URL del back.
- **Fotos:** en deploy usa volumen/disco para `backend/uploads` o un S3, si no se pierden al redeployar.
