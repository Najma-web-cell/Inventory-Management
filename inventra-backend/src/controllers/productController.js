const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const APIFeatures = require('../utils/apiFeatures');
const httpError = require('../utils/httpError');
const { logAction } = require('../utils/audit');

const SELECT = `
  SELECT p.*, c.name AS category_name, s.name AS supplier_name
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN suppliers s ON p.supplier_id = s.id`;

const removeFiles = (urls = []) =>
  urls.forEach((u) => fs.unlink(path.join(__dirname, '../../public', u), () => {}));

const toId = (v) => (v === undefined || v === null || v === '' ? null : parseInt(v, 10));

exports.getProducts = async (req, res, next) => {
  try {
    const features = new APIFeatures(SELECT, 'SELECT COUNT(*) FROM products p', req.query);
    const { data, pagination } = await features.execute(db);
    res.json({ success: true, data, pagination });
  } catch (e) { next(e); }
};

exports.getProduct = async (req, res, next) => {
  try {
    const r = await db.query(`${SELECT} WHERE p.id = $1`, [req.params.id]);
    if (!r.rowCount) throw httpError(404, 'Product not found');
    res.json({ success: true, product: r.rows[0] });
  } catch (e) { next(e); }
};

exports.createProduct = async (req, res, next) => {
  const client = await db.pool.connect();
  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
  try {
    const { sku, name, description, category_id, supplier_id, unit_price, cost_price, stock_quantity, reorder_level } = req.body;
    await client.query('BEGIN');
    const r = await client.query(
      `INSERT INTO products (sku, name, description, category_id, supplier_id, unit_price, cost_price, stock_quantity, reorder_level, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [sku, name, description || null, toId(category_id), toId(supplier_id), unit_price, cost_price,
       parseInt(stock_quantity, 10) || 0, reorder_level === undefined || reorder_level === '' ? 10 : parseInt(reorder_level, 10), JSON.stringify(images)]
    );
    const product = r.rows[0];
    await logAction(client, { product, type: 'CREATE', qty: product.stock_quantity, previousStock: 0, newStock: product.stock_quantity, user: req.user, note: 'Product created' });
    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (e) {
    await client.query('ROLLBACK');
    removeFiles(images);
    next(e);
  } finally { client.release(); }
};

exports.updateProduct = async (req, res, next) => {
  const client = await db.pool.connect();
  const newImages = (req.files || []).map((f) => `/uploads/${f.filename}`);
  try {
    const { sku, name, description, category_id, supplier_id, unit_price, cost_price, reorder_level } = req.body;
    await client.query('BEGIN');
    const old = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (!old.rowCount) throw httpError(404, 'Product not found');

    const images = newImages.length ? newImages : old.rows[0].images;
    const r = await client.query(
      `UPDATE products SET sku=$1, name=$2, description=$3, category_id=$4, supplier_id=$5,
         unit_price=$6, cost_price=$7, reorder_level=$8, images=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [sku, name, description || null, toId(category_id), toId(supplier_id), unit_price, cost_price,
       reorder_level === undefined || reorder_level === '' ? old.rows[0].reorder_level : parseInt(reorder_level, 10),
       JSON.stringify(images), req.params.id]
    );
    await logAction(client, { product: r.rows[0], type: 'EDIT', previousStock: r.rows[0].stock_quantity, newStock: r.rows[0].stock_quantity, user: req.user, note: 'Product details updated' });
    await client.query('COMMIT');
    if (newImages.length) removeFiles(old.rows[0].images);
    res.json({ success: true, message: 'Product updated successfully', product: r.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    removeFiles(newImages);
    next(e);
  } finally { client.release(); }
};

exports.deleteProduct = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rowCount) throw httpError(404, 'Product not found');
    const product = r.rows[0];
    // audit rows keep a snapshot of the product (product_id becomes NULL via FK)
    await logAction(client, { product, productId: null, type: 'DELETE', previousStock: product.stock_quantity, newStock: 0, user: req.user, note: 'Product deleted' });
    await client.query('COMMIT');
    removeFiles(product.images);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (e) {
    await client.query('ROLLBACK');
    next(e);
  } finally { client.release(); }
};
