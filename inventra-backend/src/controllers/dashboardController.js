const db = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const [kpi, monthly, breakdown, recent, lowStock] = await Promise.all([
      db.query(`
        SELECT COUNT(*)::int AS total_products,
               COALESCE(SUM(stock_quantity),0)::int AS total_units,
               COUNT(*) FILTER (WHERE stock_quantity > 0 AND stock_quantity <= reorder_level)::int AS low_stock,
               COUNT(*) FILTER (WHERE stock_quantity = 0)::int AS out_of_stock,
               COALESCE(SUM(stock_quantity * cost_price),0)::float AS cost_value,
               COALESCE(SUM(stock_quantity * unit_price),0)::float AS retail_value,
               (SELECT COUNT(*)::int FROM suppliers WHERE status = 'Active') AS active_suppliers,
               (SELECT COUNT(*)::int FROM categories) AS categories
        FROM products`),
      db.query(`
        SELECT to_char(m, 'Mon') AS month,
               COALESCE(SUM(l.qty) FILTER (WHERE l.type='INBOUND' OR (l.type='ADJUSTMENT' AND l.qty > 0)),0)::int AS stock_in,
               COALESCE(-SUM(l.qty) FILTER (WHERE l.type='OUTBOUND' OR (l.type='ADJUSTMENT' AND l.qty < 0)),0)::int AS stock_out
        FROM generate_series(date_trunc('month', NOW()) - interval '5 months', date_trunc('month', NOW()), interval '1 month') m
        LEFT JOIN stock_logs l ON date_trunc('month', l.timestamp) = m AND l.type IN ('INBOUND','OUTBOUND','ADJUSTMENT')
        GROUP BY m ORDER BY m`),
      db.query(`SELECT type, COUNT(*)::int AS count FROM stock_logs WHERE type IN ('INBOUND','OUTBOUND','ADJUSTMENT') GROUP BY type`),
      db.query(`SELECT id, product_name, sku, type, qty, COALESCE(user_name,'Deleted user') AS user_name, timestamp
                FROM stock_logs ORDER BY timestamp DESC, id DESC LIMIT 5`),
      db.query(`SELECT id, name, sku, stock_quantity, reorder_level FROM products
                WHERE stock_quantity <= reorder_level ORDER BY stock_quantity ASC, name LIMIT 6`),
    ]);

    res.json({
      success: true,
      kpi: kpi.rows[0],
      monthly: monthly.rows,
      breakdown: breakdown.rows,
      recent: recent.rows,
      lowStockItems: lowStock.rows,
    });
  } catch (e) { next(e); }
};
