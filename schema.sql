-- ============================================================
-- ESQUEMA SQL PARA NEON (PostgreSQL)
-- Catálogo Digital Inteligente
-- ============================================================

-- 1. Crear extensión para UUID si fuera necesaria (opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insertar roles por defecto
INSERT INTO roles (id, name) VALUES 
(1, 'admin'),
(2, 'user')
ON CONFLICT (id) DO NOTHING;

-- 3. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT NOT NULL DEFAULT 2 REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Categorías (Imágenes circulares)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Subcategorías
CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_subcategory_per_category UNIQUE (category_id, name)
);

-- 6. Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INT REFERENCES subcategories(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    stock INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Configuración del Catálogo
CREATE TABLE IF NOT EXISTS catalog_settings (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL DEFAULT 'Catálogo Inteligente',
    logo_url TEXT,
    primary_color VARCHAR(30) DEFAULT '#8b5cf6',
    secondary_color VARCHAR(30) DEFAULT '#06b6d4',
    whatsapp_number VARCHAR(30) DEFAULT '+573001234567',
    secondary_whatsapp VARCHAR(30) DEFAULT '+519XXXXXXXX',
    contact_email VARCHAR(100) DEFAULT 'contacto@catalogointeligente.com',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compatibilidad con instalaciones existentes.
ALTER TABLE catalog_settings ADD COLUMN IF NOT EXISTS secondary_whatsapp VARCHAR(30) DEFAULT '+519XXXXXXXX';

-- Insertar configuración inicial
INSERT INTO catalog_settings (id, store_name, logo_url, primary_color, secondary_color, whatsapp_number, secondary_whatsapp, contact_email)
VALUES (
    1, 
    'Aura CyberCatalog', 
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80', 
    '#8b5cf6', 
    '#06b6d4', 
    '+573001234567', 
    '+519XXXXXXXX',
    'admin@catalogo.com'
) ON CONFLICT (id) DO NOTHING;

-- Índices para optimizar búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
