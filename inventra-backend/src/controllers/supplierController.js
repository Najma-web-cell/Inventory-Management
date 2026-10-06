const db = require('../config/db');
const httpError = require('../utils/httpError');

exports.getSuppliers = async (req, res, next) => {
  try {
    const r = await db.query(`
      SELECT s.*, COUNT(p.id)::int AS product_count
      FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
      GROUP BY s.id ORDER BY s.name ASC`);
    res.json({ success: true, suppliers: r.rows });
  } catch (e) { next(e); }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const r = await db.query(
      'INSERT INTO suppliers (name, email, phone, address) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, email, phone || null, address || null]
    );
    res.status(201).json({ success: true, supplier: { ...r.rows[0], product_count: 0 } });
  } catch (e) { next(e); }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const r = await db.query(
      'UPDATE suppliers SET name=$1, email=$2, phone=$3, address=$4 WHERE id=$5 RETURNING *',
      [name, email, phone || null, address || null, req.params.id]
    );
    if (!r.rowCount) throw httpError(404, 'Supplier not found');
    res.json({ success: true, supplier: r.rows[0] });
  } catch (e) { next(e); }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const used = await db.query('SELECT COUNT(*)::int AS n FROM products WHERE supplier_id = $1', [req.params.id]);
    if (used.rows[0].n > 0) throw httpError(409, `Cannot delete: ${used.rows[0].n} product(s) still use this supplier.`);
    const r = await db.query('DELETE FROM suppliers WHERE id = $1', [req.params.id]);
    if (!r.rowCount) throw httpError(404, 'Supplier not found');
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (e) { next(e); }
};
