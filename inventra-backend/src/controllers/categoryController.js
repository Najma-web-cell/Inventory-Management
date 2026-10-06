const db = require('../config/db');
const httpError = require('../utils/httpError');

const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

exports.getCategories = async (req, res, next) => {
  try {
    const r = await db.query(`
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM categories c LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id ORDER BY c.name ASC`);
    res.json({ success: true, categories: r.rows });
  } catch (e) { next(e); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const r = await db.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1,$2,$3) RETURNING *',
      [name, slugify(name), description || null]
    );
    res.status(201).json({ success: true, category: { ...r.rows[0], product_count: 0 } });
  } catch (e) { next(e); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const r = await db.query(
      'UPDATE categories SET name=$1, slug=$2, description=$3 WHERE id=$4 RETURNING *',
      [name, slugify(name), description || null, req.params.id]
    );
    if (!r.rowCount) throw httpError(404, 'Category not found');
    res.json({ success: true, category: r.rows[0] });
  } catch (e) { next(e); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const used = await db.query('SELECT COUNT(*)::int AS n FROM products WHERE category_id = $1', [req.params.id]);
    if (used.rows[0].n > 0) throw httpError(409, `Cannot delete: ${used.rows[0].n} product(s) still use this category.`);
    const r = await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    if (!r.rowCount) throw httpError(404, 'Category not found');
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) { next(e); }
};
