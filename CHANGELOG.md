# Changelog

## [0.4.1] - 2026-10-05
### Corregido
- Arranque en Docker: la inicialización de la base de datos se ejecuta una sola vez (`init_db.py` desde `entrypoint.sh`) en lugar de hacerlo en cada worker de gunicorn, lo que provocaba un error de tabla duplicada en Postgres. Se agregó verificación de salud a la base de datos en `docker-compose.yml`.
- Textos normalizados a español neutro en mensajes de la API y pantallas (login, usuarios, menú).
- Verificado con 14 pruebas funcionales sobre despliegue limpio: salud, login por rol, productos, stock bajo, dashboard, venta con descuento de stock, gastos, proxy nginx y usuarios iniciales.

## [0.4.0] - 2026-10-05
### Agregado
- Backend: modelo `User` + tabla `users` con roles `dueno|vendedor` (clave con hash), `POST /api/auth/login`, `POST /api/auth/register` (bootstrap + solo dueño con headers X-USER/X-ROL), `GET /api/users`, `PUT /api/users/<id>` (rol/activo/clave), seed `dueno/dueno123` + `vendedora/venta123`, `GET /api/products/low-stock` (stock <= stock_min), `GET /api/dashboard` ahora trae `stock_bajo`, `GET /api/health` reporta `0.4.0`.
- Backend Postgres + deploy: `DB_ENGINE=postgres` por `DATABASE_URL` o `PG_*` (psycopg2), pool chico, `CORS` por `FRONTEND_ORIGIN`, `wsgi.py` + `gunicorn`, `backend/Dockerfile`, `frontend/Dockerfile` (nginx con proxy /api y /uploads), `docker-compose.yml` (postgres + backend + frontend), `schema.sql` con tabla users (nota SERIAL para Postgres).
- Frontend: login con roles (guarda sesión, redirige dueño→dashboard y vendedor→ventas), `authGuard` + `duenoGuard`, menú según rol + usuario visible + salir, página **Usuarios** (solo dueño: crear, cambiar rol, activar/desactivar), **Inventario** con banner stock bajo + filtro + reponer +10, **Dashboard** con tarjeta stock bajo, `apiBase()` que usa Flask directo en dev y `/api` relativo en Docker.
- Docs: README v0.4 con probar roles/stock y deploy Docker + Postgres + Render.

## [0.3.0] - 2026-10-05
### Agregado
- Backend: modelo `Expense` + tabla `expenses`, CRUD `GET/POST /api/expenses`, `PUT/DELETE /api/expenses/<id>` (filtros ?desde&hasta&categoria, validación concepto/categoria/monto), `GET /api/expenses/resumen` (total + por categoría), `GET /api/dashboard` (ventas, gastos, utilidad, margen %, por medio pago, gastos por categoría, top 5 productos, ventas/gastos por día, rango por defecto 30 días).
- Frontend: página **Gastos** (formulario nuevo/editar, filtros fecha+categoría, KPIs total/ticket/mayor categoría, tabla con editar/eliminar), página **Dashboard dueño** (KPIs ventas/gastos/utilidad, filtros + atajos 7 días/mes, gráfico barras ventas vs gastos 14 días, top productos, desglose medios y categorías), menú + rutas actualizadas. `GET /api/health` ahora reporta `0.3.0`.
- Docs: `schema.sql` con tabla expenses, README v0.3.

## [0.2.0] - 2026-10-03
### Agregado
- Backend: tablas `sales` + `sale_items`, `POST /api/sales` (folio B-000001…, precio desde BD, descuenta stock en transacción, valida stock/medios), `GET /api/sales` con filtro ?desde&hasta, `GET /api/sales/<id>` detalle, `GET /api/sales/resumen` (hoy, 7 días, rango, ticket promedio).
- Frontend: página **Ventas** (buscador + agregar, carrito con cantidades, medio de pago, vendedor, cobrar), página **Boletas** (KPIs hoy/7 días/ticket, filtro fechas, tabla, detalle con impresión), menú actualizado. Tag `v0.2.0`.

## [0.1.0] - 2026-10-03
### Agregado
- Esqueleto Flask (health, CRUD /api/products, upload /api/upload, config mysql/sqlite).
- BD relacional products + schema.sql + seed chileno 2026 (15 productos CLP).
- Frontend Angular Material: toolbar + sidenav, Catálogo responsive (1/2/4 col, buscador, filtro), Inventario (tabla, nuevo/editar/eliminar, subida fotos).
- VERSION, README, .gitignore. Tag `v0.1.0`.
### Nota Dolphin
- No se encontró MySQL/Dolphin corriendo: v0.1 parte en SQLite. Para MySQL ver README paso Dolphin.
