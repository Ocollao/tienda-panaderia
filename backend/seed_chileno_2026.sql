-- v0.1 Seed chileno 2026 para MySQL/Dolphin
USE tienda_panaderia;
INSERT INTO products (nombre, categoria, precio, stock, descripcion) VALUES
('Marraqueta (kg)', 'panaderia', 2490, 40, 'Crujiente, ideal desayuno chileno.'),
('Hallulla (kg)', 'panaderia', 2390, 35, 'Blanda para sandwich.'),
('Pan amasado c/u', 'panaderia', 650, 50, 'Receta casera con manteca.'),
('Dobladita c/u', 'panaderia', 700, 30, 'Delgada, con queso opcional.'),
('Empanada de pino', 'panaderia', 2200, 25, 'Pino, huevo y aceituna.'),
('Torta mil hojas 15p', 'pasteleria', 18990, 6, 'Manjar y crema pastelera.'),
('Kuchen frambuesa', 'pasteleria', 9990, 8, 'Estilo sureno con migas.'),
('Berlin con crema', 'pasteleria', 1200, 20, 'Azucar flor y crema.'),
('Donut glaseada', 'pasteleria', 1100, 22, 'Glaseado de colores.'),
('Chilenitos x6', 'pasteleria', 4500, 12, 'Hojarasca con manjar.'),
('Leche entera 1L', 'minimarket', 1590, 30, 'Leche entera caja.'),
('Bebida familiar 3L', 'minimarket', 3290, 24, 'Sabor cola desechable.'),
('Cafe molido 500g', 'minimarket', 8990, 10, 'Tueste medio nacional.'),
('Mantequilla 250g', 'minimarket', 3490, 15, 'Con sal, para el pan.'),
('Huevos x12', 'minimarket', 4990, 18, 'Gallina libre grandes.');
