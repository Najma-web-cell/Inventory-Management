const db = require('../config/db');
const httpError = require('../utils/httpError');
const { logAction } = require('../utils/audit');

const LOG_TYPE = { IN: 'INBOUND', OUT: 'OUTBOUND', ADJUSTMENT: 'ADJUSTMENT' };

// Inbound / Outbound / Adjustment (set exact count) - transactional + audited
exports.adjustStock = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { productId, quantity, type, note } = req.body;
    const qty = parseInt(quantity, 10);

    if (type === 'ADJUSTMENT' && !['Admin', 'Manager'].includes(req.user.role)) {
      throw httpError(403, 'Only Admin or Manager can make manual stock adjustments.');
    }

    await client.query('BEGIN');
    const found = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [productId]);
    if (!found.rowCount) throw httpError(404, 'Product not found');
    const product = found.rows[0];
    const previousStock = product.stock_quantity;

    const newStock = type === 'IN' ? previousStock + qty : type === 'OUT' ? previousStock - qty : qty;
    if (newStock < 0) throw httpError(400, `Insufficient stock! Only ${previousStock} units available.`);

    await client.query('UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2', [newStock, productId]);
    await logAction(client, {
      product, type: LOG_TYPE[type], qty: newStock - previousStock, previousStock, newStock, note, user: req.user,
    });
    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: { productId: product.id, previousStock, newStock, type },
    });
  } catch (e) {
    await client.query('ROLLBACK');
    next(e);
  } finally { client.release(); }
};

const LOG_SELECT = `
  SELECT id, product_id, product_name, sku, type, qty, previous_stock, new_stock, note,
         COALESCE(user_name, 'Deleted user') AS user_name, user_role, timestamp
  FROM stock_logs`;

// Audit trail. ?movements=true -> only stock movements (no CREATE/EDIT/DELETE)
exports.getAllStockLogs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
    const where = req.query.movements === 'true' ? "WHERE type IN ('INBOUND','OUTBOUND','ADJUSTMENT')" : '';
    const r = await db.query(`${LOG_SELECT} ${where} ORDER BY timestamp DESC, id DESC LIMIT $1`, [limit]);
    res.json({ success: true, logs: r.rows });
  } catch (e) { next(e); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const r = await db.query(`${LOG_SELECT} WHERE product_id = $1 ORDER BY timestamp DESC, id DESC`, [req.params.productId]);
    res.json({ success: true, history: r.rows });
  } catch (e) { next(e); }
};
