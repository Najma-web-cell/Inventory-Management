-- Inventra schema (PostgreSQL)
-- WARNING: this file DROPS and recreates all tables. Used by `npm run db:setup`.

DROP TABLE IF EXISTS stock_logs CASCADE;
DROP TABLE IF EXISTS inventory_history CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS movement_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS stock_log_type CASCADE;

CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Staff');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    cost_price DECIMAL(10, 2) NOT NULL CHECK (cost_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_name ON products(LOWER(name));

CREATE TYPE stock_log_type AS ENUM ('INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'CREATE', 'EDIT', 'DELETE');

-- Immutable audit trail. Product / user details are snapshotted so the log
-- survives deletion of the product or the user. qty is a signed stock delta.
CREATE TABLE stock_logs (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    type stock_log_type NOT NULL,
    qty INT NOT NULL DEFAULT 0,
    previous_stock INT,
    new_stock INT,
    note TEXT,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    user_role VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_logs_time ON stock_logs(timestamp DESC);
CREATE INDEX idx_stock_logs_product ON stock_logs(product_id);
