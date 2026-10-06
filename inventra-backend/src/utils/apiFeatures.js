const SORTABLE = ['name', 'sku', 'unit_price', 'cost_price', 'stock_quantity', 'reorder_level', 'created_at', 'updated_at'];

class APIFeatures {
  constructor(baseQuery, countQuery, queryParams) {
    this.baseQuery = baseQuery;
    this.countQuery = countQuery;
    this.q = queryParams;
    this.where = [];
    this.values = [];
    this.sortClause = 'ORDER BY p.created_at DESC';
    this.limit = Math.min(Math.max(parseInt(queryParams.limit, 10) || 10, 1), 100);
    this.page = Math.max(parseInt(queryParams.page, 10) || 1, 1);
    this.offset = (this.page - 1) * this.limit;
  }

  add(clause, value) {
    this.values.push(value);
    this.where.push(clause.replace('?', `$${this.values.length}`));
  }

  search() {
    if (this.q.search) {
      const idx = this.values.length + 1;
      this.values.push(`%${String(this.q.search).trim()}%`);
      this.where.push(`(p.name ILIKE $${idx} OR p.sku ILIKE $${idx} OR p.description ILIKE $${idx})`);
    }
    return this;
  }

  filter() {
    const id = (v) => (/^\d+$/.test(String(v)) ? parseInt(v, 10) : null);
    if (this.q.category_id && id(this.q.category_id) !== null) this.add('p.category_id = ?', id(this.q.category_id));
    if (this.q.supplier_id && id(this.q.supplier_id) !== null) this.add('p.supplier_id = ?', id(this.q.supplier_id));
    if (this.q.low_stock === 'true') this.where.push('p.stock_quantity > 0 AND p.stock_quantity <= p.reorder_level');
    if (this.q.out_of_stock === 'true') this.where.push('p.stock_quantity = 0');
    return this;
  }

  // Whitelisted columns only -> no SQL injection through ?sort=
  sort() {
    if (this.q.sort) {
      const parts = String(this.q.sort)
        .split(',')
        .map((f) => ({ field: f.replace(/^-/, ''), dir: f.startsWith('-') ? 'DESC' : 'ASC' }))
        .filter((f) => SORTABLE.includes(f.field))
        .map((f) => `p.${f.field} ${f.dir}`);
      if (parts.length) this.sortClause = `ORDER BY ${parts.join(', ')}`;
    }
    return this;
  }

  async execute(db) {
    this.search().filter().sort();
    const whereString = this.where.length ? `WHERE ${this.where.join(' AND ')}` : '';

    const countResult = await db.query(`${this.countQuery} ${whereString}`, this.values);
    const totalRecords = parseInt(countResult.rows[0].count, 10);

    const n = this.values.length;
    const dataResult = await db.query(
      `${this.baseQuery} ${whereString} ${this.sortClause} LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...this.values, this.limit, this.offset]
    );

    return {
      data: dataResult.rows,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / this.limit) || 1,
        currentPage: this.page,
        limit: this.limit,
      },
    };
  }
}

module.exports = APIFeatures;
