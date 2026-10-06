// Usage: npm run db:setup   -> (re)creates all tables and inserts demo data.
// Works with any PostgreSQL (pgAdmin users: just make sure the database in .env exists).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const DEMO_USERS = [
  ['Najma Chaudhary', 'admin@inventra.com', 'Admin@123', 'Admin'],
  ['Manager User', 'manager@inventra.com', 'Manager@123', 'Manager'],
  ['Staff User', 'staff@inventra.com', 'Staff@123', 'Staff'],
];

const CATEGORIES = [
  ['Electronics', 'electronics', 'Laptops, mobile devices, and core processing tech'],
  ['Monitors', 'monitors', 'High-resolution desktop displays'],
  ['Accessories', 'accessories', 'Peripherals, cables, and mechanical keyboards'],
  ['Furniture', 'furniture', 'Office desks, chairs, and ergonomic gear'],
];

const SUPPLIERS = [
  ['LogiTech Corp', 'sales@logitech.com', '+1 800-555-0199'],
  ['Dell Inc', 'support@dell.com', '+1 800-555-0233'],
  ['Keychron Co', 'orders@keychron.com', '+1 800-555-0781'],
  ['Herman Miller', 'b2b@hermanmiller.com', '+1 800-555-0912'],
  ['Apple Inc', 'enterprise@apple.com', '+1 800-555-0100'],
];

// sku, name, category idx, supplier idx, unit_price, cost_price, stock, reorder
const PRODUCTS = [
  ['SKU-8821', 'Logitech MX Master 3S', 2, 0, 99.99, 70, 42, 10],
  ['SKU-4412', 'Dell UltraSharp 27" Monitor', 1, 1, 450, 330, 5, 10],
  ['SKU-1092', 'Keychron K2 Mechanical Keyboard', 2, 2, 89, 55, 120, 20],
  ['SKU-9021', 'Ergonomic Office Chair', 3, 3, 650, 420, 0, 5],
  ['SKU-3321', 'Apple MacBook Pro M3', 0, 4, 1999, 1650, 18, 5],
  ['SKU-5530', 'Logitech MX Keys Keyboard', 2, 0, 119.99, 80, 35, 10],
  ['SKU-6104', 'Dell P2723QE 4K Monitor', 1, 1, 520, 390, 9, 8],
  ['SKU-7712', 'Herman Miller Standing Desk', 3, 3, 899, 640, 7, 5],
];

(async () => {
  const client = await pool.connect();
  try {
    console.log('Creating schema...');
    await client.query(fs.readFileSync(path.join(__dirname, '../models/schema.sql'), 'utf8'));
    await client.query('BEGIN');

    const users = [];
    for (const [name, email, pw, role] of DEMO_USERS) {
      const r = await client.query(
        'INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id,name,role',
        [name, email, await bcrypt.hash(pw, 10), role]
      );
      users.push(r.rows[0]);
    }
    const catIds = [], supIds = [], prods = [];
    for (const c of CATEGORIES) catIds.push((await client.query('INSERT INTO categories (name,slug,description) VALUES ($1,$2,$3) RETURNING id', c)).rows[0].id);
    for (const s of SUPPLIERS) supIds.push((await client.query('INSERT INTO suppliers (name,email,phone) VALUES ($1,$2,$3) RETURNING id', s)).rows[0].id);
    for (const p of PRODUCTS) {
      const r = await client.query(
        `INSERT INTO products (sku,name,category_id,supplier_id,unit_price,cost_price,stock_quantity,reorder_level)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,sku,name`,
        [p[0], p[1], catIds[p[2]], supIds[p[3]], p[4], p[5], p[6], p[7]]
      );
      prods.push(r.rows[0]);
    }

    // Historical movements spread over the last 6 months (feeds the dashboard chart)
    const history = [
      [150, 0, 'INBOUND', 200], [140, 1, 'INBOUND', 60], [128, 2, 'INBOUND', 150], [118, 4, 'INBOUND', 30],
      [100, 2, 'OUTBOUND', -40], [92, 0, 'OUTBOUND', -90], [80, 3, 'INBOUND', 25], [70, 4, 'OUTBOUND', -14],
      [58, 1, 'OUTBOUND', -20], [45, 5, 'INBOUND', 80], [36, 3, 'OUTBOUND', -25], [28, 6, 'INBOUND', 30],
      [20, 7, 'OUTBOUND', -6], [12, 0, 'INBOUND', 20], [8, 3, 'OUTBOUND', -5], [4, 1, 'ADJUSTMENT', -2],
    ];
    for (const [daysAgo, pi, type, qty] of history) {
      const u = users[(pi + daysAgo) % 2]; // Admin / Manager
      await client.query(
        `INSERT INTO stock_logs (product_id,product_name,sku,type,qty,user_id,user_name,user_role,note,timestamp)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Demo data', NOW() - ($9 || ' days')::interval)`,
        [prods[pi].id, prods[pi].name, prods[pi].sku, type, qty, u.id, u.name, u.role, String(daysAgo)]
      );
    }
    await client.query('COMMIT');

    console.log('\nDone. Demo logins:');
    DEMO_USERS.forEach(([, e, p, r]) => console.log(`  ${r.padEnd(8)} ${e}  /  ${p}`));
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Setup failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
