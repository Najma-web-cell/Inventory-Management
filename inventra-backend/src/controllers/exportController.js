const db = require('../config/db');
const { Parser } = require('json2csv');

const sendCsv = (res, name, rows) => {
  const csv = rows.length ? new Parser().parse(rows) : '';
  res.header('Content-Type', 'text/csv');
  res.attachment(`${name}-${new Date().toISOString().slice(0, 10)}.csv`);
  res.send(csv);
};

// json2csv does not guard against CSV/Excel formula injection - neutralise leading = + - @
const safe = (rows) => rows.map((r) => Object.fromEntries(
  Object.entries(r).map(([k, v]) => [k, typeof v === 'string' && /^[=+\-@]/.test(v) ? `'${v}` : v])
));

const handler = (name, sql) => async (req, res, next) => {
  try { sendCsv(res, name, safe((await db.query(sql)).rows)); } catch (e) { next(e); }
};

exports.exportProductsCSV = handler('inventory', `
  SELECT p.sku, p.name, c.name AS category, s.name AS supplier, p.unit_price, p.cost_price, p.stock_quantity, p.reorder_level
  FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN suppliers s ON p.supplier_id = s.id
  ORDER BY p.name`);

exports.exportValuationCSV = handler('inventory-valuation', `
  SELECT p.sku, p.name, c.name AS category, p.stock_quantity, p.cost_price, p.unit_price,
         ROUND(p.stock_quantity * p.cost_price, 2) AS total_cost_value,
         ROUND(p.stock_quantity * p.unit_price, 2) AS total_retail_value
  FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY total_cost_value DESC`);

exports.exportMovementsCSV = handler('stock-movements', `
  SELECT id, timestamp, sku, product_name, type, qty, previous_stock, new_stock, user_name, note
  FROM stock_logs WHERE type IN ('INBOUND','OUTBOUND','ADJUSTMENT') ORDER BY timestamp DESC`);

exports.exportAuditCSV = handler('audit-trail', `
  SELECT id, timestamp, type AS action, sku, product_name, qty, user_name, user_role, note
  FROM stock_logs ORDER BY timestamp DESC`);
