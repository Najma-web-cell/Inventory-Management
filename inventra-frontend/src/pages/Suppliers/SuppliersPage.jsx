import { useCallback, useEffect, useState } from 'react';
import { Plus, Building2, Phone, Mail, Edit2, Trash2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Modal, { Field, confirmDelete } from '../../components/ui/Modal';
import { theme, primaryBtn, inputBase } from '../../components/ui/theme';

const EMPTY = { name: '', email: '', phone: '', address: '' };

export default function SuppliersPage({ darkMode }) {
  const { can } = useAuth();
  const toast = useToast();
  const t = theme(darkMode);
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => api.suppliers().then((r) => setItems(r.suppliers)).catch((e) => toast(e.message, 'error')), [toast]);
  useEffect(() => { load(); }, [load]);

  const open = (s) => { setError(''); setForm(s ? { name: s.name, email: s.email, phone: s.phone || '', address: s.address || '' } : EMPTY); setEditing(s || 'new'); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.saveSupplier(editing === 'new' ? null : editing.id, form);
      toast(editing === 'new' ? 'Supplier added' : 'Supplier updated');
      setEditing(null); load();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const remove = async (s) => {
    if (!confirmDelete(`supplier "${s.name}"`)) return;
    try { await api.deleteSupplier(s.id); toast('Supplier deleted'); load(); } catch (err) { toast(err.message, 'error'); }
  };

  const f = `${inputBase} ${t.input}`;

  return (
    <div className="space-y-6 inventra-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${t.title}`}>Suppliers Directory</h1>
          <p className={`text-xs ${t.muted} mt-1`}>Manage vendor contact details, contracts, and procurement sources</p>
        </div>
        {can('Admin', 'Manager') && <button onClick={() => open(null)} className={primaryBtn}><Plus className="w-4 h-4" /> Add New Supplier</button>}
      </div>

      {!items ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 && <p className={`text-sm ${t.muted}`}>No suppliers yet.</p>}
          {items.map((s) => (
            <div key={s.id} className={`p-5 rounded-2xl border space-y-4 ${t.panel}`}>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
                <div className="flex items-center gap-1">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold mr-1">{s.status}</span>
                  {can('Admin', 'Manager') && <button onClick={() => open(s)} aria-label={`Edit ${s.name}`} className={`p-1.5 rounded-lg hover:text-emerald-600 ${t.iconBtn}`}><Edit2 size={15} /></button>}
                  {can('Admin') && <button onClick={() => remove(s)} aria-label={`Delete ${s.name}`} className={`p-1.5 rounded-lg hover:text-rose-600 ${t.iconBtn}`}><Trash2 size={15} /></button>}
                </div>
              </div>
              <div>
                <h3 className={`text-base font-bold ${t.title}`}>{s.name}</h3>
                <p className={`text-xs ${t.muted}`}>{s.product_count} product{s.product_count === 1 ? '' : 's'} supplied</p>
              </div>
              <div className={`space-y-2 pt-3 border-t text-xs ${t.muted} ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {s.email}</div>
                {s.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {s.phone}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal darkMode={darkMode} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add New Supplier' : 'Edit Supplier'}>
          <form onSubmit={save} className="space-y-3">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</div>}
            <Field darkMode={darkMode} label="Company Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={f} /></Field>
            <Field darkMode={darkMode} label="Email Address"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={f} /></Field>
            <Field darkMode={darkMode} label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9+()\-\s]/g, '') })} placeholder="+1 800-555-0100" className={f} /></Field>
            <Field darkMode={darkMode} label="Address"><textarea rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={f} /></Field>
            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className={`px-4 py-2 text-xs font-semibold rounded-xl ${t.ghostBtn}`}>Cancel</button>
              <button type="submit" disabled={saving} className={primaryBtn}>{saving && <Loader2 className="w-4 h-4 animate-spin" />}Save Supplier</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
