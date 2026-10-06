// Writes one row to the immutable audit trail. `client` can be a pg client or the db module.
exports.logAction = (client, { product, productId, type, qty = 0, previousStock = null, newStock = null, note = null, user }) =>
  client.query(
    `INSERT INTO stock_logs
       (product_id, product_name, sku, type, qty, previous_stock, new_stock, note, user_id, user_name, user_role)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      productId ?? product.id ?? null,
      product.name,
      product.sku || null,
      type,
      qty,
      previousStock,
      newStock,
      note,
      user?.id ?? null,
      user?.name ?? null,
      user?.role ?? null,
    ]
  );
