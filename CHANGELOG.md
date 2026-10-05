# Changelog

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
