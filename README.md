# 🥖 La Espiga — Tienda Panadería / Pastelería / Minimarket `v0.3.0`

Proyecto simple, vistoso y responsive (móvil / tablet / web).

**Stack v0.3:** Python Flask (API) + Angular Material (frontend) + SQLite (rápido) / MySQL-Dolphin (opcional).

## Estructura
```
backend/   -> Flask API + SQLite/MySQL + fotos en uploads/
frontend/  -> Angular 20 + Material (catálogo + inventario + ventas + gastos + dashboard)
VERSION / CHANGELOG.md
```

## Requisitos
Python 3.12 + Node 22 + Angular CLI 20.

## 1) Backend (puerto 5000)
```powershell
cd backend
pip install -r requirements.txt
Copy-Item .env.example .env   # viene en sqlite; para Dolphin/MySQL edita .env a DB_ENGINE=mysql
python app.py
# test: http://127.0.0.1:5000/api/health  -> {"db":"ok"}
# productos: http://127.0.0.1:5000/api/products
```

**Dolphin/MySQL rápido:**
1. Abre Dolphin, ejecuta `backend/schema.sql` (crea BD + tabla).
2. Ejecuta `backend/seed_chileno_2026.sql` (15 productos CLP 2026).
3. En `backend/.env` pon `DB_ENGINE=mysql` + tus credenciales y reinicia `python app.py`.

## 2) Frontend (puerto 4200)
```powershell
cd frontend
npm install
npx ng serve --open
# http://localhost:4200 -> Catálogo | Inventario | Ventas | Boletas | Gastos | Dashboard
```
El frontend apunta a `http://127.0.0.1:5000/api` (ver `products.service.ts`).

## Datos ejemplo chilenos 2026
Marraqueta, hallulla, pan amasado, empanada pino, torta mil hojas, kuchen, berlin, leche, bebida 3L, café, etc. con precios CLP 2026.

## Roadmap
- **v0.1 ✅** esqueleto + inventario CRUD + fotos + catálogo responsive
- **v0.2 ✅** ventas (carrito + cobrar) + boletas (detalle, resumen, impresión)
- **v0.3 ✅** gastos (CRUD + categorías) + dashboard dueño (ventas/gastos/utilidad, top productos, gráfico diario)
- **v0.4** roles, stock bajo, Postgres, deploy

## Probar v0.3
1. En **Ventas**: busca “marraqueta”, agrega 2, elige medio de pago y cobra → folio `B-000001`.
2. En **Boletas**: ve KPIs, abre el detalle (🔍) e imprime.
3. En **Gastos**: crea “Harina 25kg / insumos / 28990” y “Arriendo / arriendo / 450000”.
4. En **Dashboard**: filtra por fechas o usa “Últimos 7 días”, revisa utilidad = ventas − gastos, top productos y barras diarias.
5. API: `POST /api/sales {"items":[{"product_id":1,"cantidad":2}]}` descuenta stock.
   `POST /api/expenses {"concepto":"Harina","categoria":"insumos","monto":28990}` ·
   `GET /api/dashboard?desde=2026-10-01&hasta=2026-10-05`
