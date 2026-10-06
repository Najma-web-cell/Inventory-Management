import { useCallback, useEffect, useState } from 'react';
import { Plus, Layers, Edit2, Trash2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Modal, { Field, confirmDelete } from '../../components/ui/Modal';
import { theme, primaryBtn, inputBase } from '../../components/ui/theme';

export default function CategoriesPage({ darkMode }) {
  const { can } = useAuth();
  const toast = useToast();
  const t = theme(darkMode);
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => api.categories().then((r) => setItems(r.categories)).catch((e) => toast(e.message, 'error')), [toast]);
  useEffect(() => { load(); }, [load]);

  const open = (c) => { setError(''); setForm(c ? { name: c.name, description: c.description || '' } : { name: '', description: '' }); setEditing(c || 'new'); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.saveCategory(editing === 'new' ? null : editing.id, form);
      toast(editing === 'new' ? 'Category added' : 'Category updated');
      setEditing(null); load();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const remove = async (c) => {
    if (!confirmDelete(`category "${c.name}"`)) return;
    try { await api.deleteCategory(c.id); toast('Category deleted'); load(); } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="space-y-6 inventra-enter">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${t.title}`}>Categories Overview</h1>
          <p className={`text-sm ${t.muted}`}>Item classification and taxonomy management</p>
        </div>
        {can('Admin', 'Manager') && <button onClick={() => open(null)} className={primaryBtn}><Plus size={16} /> Add New Category</button>}
      </div>

      {!items ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.length === 0 && <p className={`text-sm ${t.muted}`}>No categories yet.</p>}
          {items.map((c) => (
            <div key={c.id} className={`group border hover:border-emerald-500/50 p-6 rounded-2xl transition-all ${t.panel}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg"><Layers size={22} /></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  {can('Admin', 'Manager') && <button onClick={() => open(c)} aria-label={`Edit ${c.name}`} className={`p-1.5 rounded-lg hover:text-emerald-600 ${t.iconBtn}`}><Edit2 size={15} /></button>}
                  {can('Admin') && <button onClick={() => remove(c)} aria-label={`Delete ${c.name}`} className={`p-1.5 rounded-lg hover:text-rose-600 ${t.iconBtn}`}><Trash2 size={15} /></button>}
                </div>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${t.title}`}>{c.name}</h3>
              <p className={`text-xs h-10 mb-4 ${t.muted}`}>{c.description}</p>
              <div className={`pt-4 border-t flex justify-between items-center text-xs ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={t.muted}>Items linked</span>
                <span className="bg-emerald-500/20 text-emerald-600 font-semibold px-2.5 py-1 rounded-full">{c.product_count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal darkMode={darkMode} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add New Category' : 'Edit Category'}>
          <form onSubmit={save} className="space-y-4">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</div>}
            <Field darkMode={darkMode} label="Category Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputBase} ${t.input}`} /></Field>
            <Field darkMode={darkMode} label="Description"><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputBase} ${t.input}`} /></Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className={`px-4 py-2 text-xs font-semibold rounded-xl ${t.ghostBtn}`}>Cancel</button>
              <button type="submit" disabled={saving} className={primaryBtn}>{saving && <Loader2 className="w-4 h-4 animate-spin" />}Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
