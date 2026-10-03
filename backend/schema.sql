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
