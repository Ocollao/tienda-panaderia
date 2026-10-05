-- v0.1 Dolphin/MySQL: pega esto en tu gestor (Dolphin) y ejecuta.
CREATE DATABASE IF NOT EXISTS tienda_panaderia CHARACTER SET utf8mb4;
USE tienda_panaderia;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  categoria VARCHAR(30) NOT NULL DEFAULT 'panaderia',
  precio INT NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  stock_min INT NOT NULL DEFAULT 5,
  descripcion VARCHAR(255) DEFAULT '',
  foto_url VARCHAR(255) DEFAULT '',
  activo TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- v0.2 Ventas y boletas
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  folio VARCHAR(20) UNIQUE DEFAULT '',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  total INT NOT NULL DEFAULT 0,
  medio_pago VARCHAR(30) DEFAULT 'efectivo',
  vendedor VARCHAR(80) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unit INT NOT NULL DEFAULT 0,
  subtotal INT NOT NULL DEFAULT 0,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
