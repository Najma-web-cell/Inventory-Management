import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Package, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Modal, { Field, confirmDelete } from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { theme, primaryBtn, inputBase, money } from '../../components/ui/theme';

const EMPTY = { name: '', sku: '', category_id: '', supplier_id: '', unit_price: '', cost_price: '', stock_quantity: '0', reorder_level: '10', description: '' };

export default function ProductsPage({ darkMode, initialSearch = '' }) {
  const { can } = useAuth();
  const toast = useToast();
  const t = theme(darkMode);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null); // product | 'new' | null
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.products({ search, category_id: categoryId, page, limit: 8 })
      .then((r) => { setRows(r.data); setPagination(r.pagination); })
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [search, categoryId, page, toast]);

  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [load]);
  useEffect(() => {
    api.categories().then((r) => setCategories(r.categories)).catch(() => {});
    api.suppliers().then((r) => setSuppliers(r.suppliers)).catch(() => {});
  }, []);

  const openForm = (p) => {
    setFormError(''); setImage(null);
    if (p) {
      setForm({ name: p.name, sku: p.sku, category_id: p.category_id ?? '', supplier_id: p.supplier_id ?? '', unit_price: p.unit_price, cost_price: p.cost_price, stock_quantity: p.stock_quantity, reorder_level: p.reorder_level, description: p.description ?? '' });
      setEditing(p);
    } else {
      setForm({ ...EMPTY, sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`, category_id: categories[0]?.id ?? '', supplier_id: suppliers[0]?.id ?? '' });
      setEditing('new');
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    if (Number(form.cost_price) > Number(form.unit_price)) return setFormError('Cost price cannot be higher than unit price.');
    const fd = new FormData();
    Object.entries({ ...form, sku: form.sku.trim().toUpperCase() }).forEach(([k, v]) => { if (editing !== 'new' && k === 'stock_quantity') return; fd.append(k, v); });
    if (image) fd.append('images', image);
    setSaving(true);
    try {
      await api.saveProduct(editing === 'new' ? null : editing.id, fd);
      toast(editing === 'new' ? 'Product created' : 'Product updated');
      setEditing(null);
      load();
    } catch (err) { setFormError(err.message); } finally { setSaving(false); }
  };

  const remove = async (p) => {
    if (!confirmDelete(`"${p.name}"`)) return;
    try { await api.deleteProduct(p.id); toast('Product deleted'); load(); } catch (err) { toast(err.message, 'error'); }
  };

  const field = `${inputBase} ${t.input}`;

  return (
    <div className="space-y-6 inventra-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${t.title}`}>Products & Catalog</h1>
          <p className={`text-xs ${t.muted} mt-1`}>Manage physical inventory, prices, stock limits, and suppliers</p>
        </div>
        {can('Admin', 'Manager') && <button onClick={() => openForm(null)} className={primaryBtn}><Plus className="w-4 h-4" /> Add New Product</button>}
      </div>

      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${t.panel}`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search product name or SKU..." className={`w-full rounded-xl pl-10 pr-4 py-2 text-xs border focus:outline-none focus:border-emerald-500 ${t.input}`} />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} aria-label="Filter by category" className={`rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-emerald-500 ${t.input}`}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${t.panel}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b uppercase font-semibold ${t.thead}`}>
              <tr>
                <th className="px-6 py-4">Product Details</th><th className="px-6 py-4">SKU</th><th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Supplier</th><th className="px-6 py-4">Stock Status</th><th className="px-6 py-4">Price</th><th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.divide}`}>
              {loading && <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-emerald-500" /></td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-slate-400">No products found.</td></tr>}
              {!loading && rows.map((p) => (
                <tr key={p.id} className={`transition-colors ${t.hover}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                        : <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Package className="w-5 h-5" /></span>}
                      <div><p className={`font-bold text-sm ${t.title}`}>{p.name}</p><p className="text-[11px] text-slate-400">ID: #{p.id}</p></div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-mono ${t.muted}`}>{p.sku}</td>
                  <td className="px-6 py-4">{p.category_name ? <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-medium">{p.category_name}</span> : <span className="text-slate-400">-</span>}</td>
                  <td className={`px-6 py-4 ${t.body}`}>{p.supplier_name || '-'}</td>
                  <td className="px-6 py-4"><StatusBadge product={p} /></td>
                  <td className={`px-6 py-4 font-bold ${t.title}`}>{money(p.unit_price)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {can('Admin', 'Manager') && <button onClick={() => openForm(p)} aria-label={`Edit ${p.name}`} className={`p-2 rounded-lg hover:text-emerald-600 ${t.iconBtn}`}><Edit2 className="w-4 h-4" /></button>}
                      {can('Admin') && <button onClick={() => remove(p)} aria-label={`Delete ${p.name}`} className={`p-2 rounded-lg hover:text-rose-600 ${t.iconBtn}`}><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`flex items-center justify-between px-6 py-3 border-t text-xs ${t.muted} ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <span>{pagination.totalRecords} product{pagination.totalRecords === 1 ? '' : 's'}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page" className={`p-1.5 rounded-lg disabled:opacity-40 ${t.ghostBtn}`}><ChevronLeft className="w-4 h-4" /></button>
            <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} aria-label="Next page" className={`p-1.5 rounded-lg disabled:opacity-40 ${t.ghostBtn}`}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {editing && (
        <Modal wide darkMode={darkMode} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add New Inventory Item' : 'Edit Product Details'}>
          <form onSubmit={save} className="space-y-4">
            {formError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{formError}</div>}
            <Field darkMode={darkMode} label="Product Name"><input required value={form.name} onChange={set('name')} placeholder="e.g. Wireless Mouse" className={field} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field darkMode={darkMode} label="SKU Code"><input required value={form.sku} onChange={set('sku')} className={`${field} uppercase`} /></Field>
              <Field darkMode={darkMode} label="Category">
                <select value={form.category_id} onChange={set('category_id')} className={field}><option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field darkMode={darkMode} label="Supplier">
                <select value={form.supplier_id} onChange={set('supplier_id')} className={field}><option value="">None</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              </Field>
              <Field darkMode={darkMode} label="Reorder Level"><input type="number" min="0" required value={form.reorder_level} onChange={set('reorder_level')} className={field} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field darkMode={darkMode} label="Unit Price ($)"><input type="number" min="0" step="0.01" required value={form.unit_price} onChange={set('unit_price')} className={field} /></Field>
              <Field darkMode={darkMode} label="Cost Price ($)"><input type="number" min="0" step="0.01" required value={form.cost_price} onChange={set('cost_price')} className={field} /></Field>
              <Field darkMode={darkMode} label="Initial Stock"><input type="number" min="0" required disabled={editing !== 'new'} value={form.stock_quantity} onChange={set('stock_quantity')} title={editing !== 'new' ? 'Use Stock Movement to change stock' : ''} className={`${field} disabled:opacity-50`} /></Field>
            </div>
            <Field darkMode={darkMode} label="Product Image (JPG/PNG/WEBP, max 2MB)">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImage(e.target.files[0] || null)} className={`${field} file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-white`} />
            </Field>
            {editing !== 'new' && <p className="text-[11px] text-slate-400">Stock quantity is changed from the Stock Movement page so every change is audited.</p>}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className={`px-4 py-2 text-xs font-semibold rounded-xl ${t.ghostBtn}`}>Cancel</button>
              <button type="submit" disabled={saving} className={primaryBtn}>{saving && <Loader2 className="w-4 h-4 animate-spin" />}{editing === 'new' ? 'Create Product' : 'Update Product'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
