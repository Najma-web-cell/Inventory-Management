import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, History, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { theme, primaryBtn, inputBase, fmtDate } from '../../components/ui/theme';

const TYPES = {
  IN: { label: 'Inbound (+ Stock)', icon: ArrowDownLeft, on: 'bg-emerald-500/20 border-emerald-500 text-emerald-600' },
  OUT: { label: 'Outbound (- Stock)', icon: ArrowUpRight, on: 'bg-rose-500/20 border-rose-500 text-rose-500' },
  ADJUSTMENT: { label: 'Set Exact Count', icon: RefreshCw, on: 'bg-amber-500/20 border-amber-500 text-amber-600' },
};
const LOG_UI = {
  INBOUND: { icon: ArrowDownLeft, cls: 'bg-emerald-500/10 text-emerald-500', txt: 'text-emerald-500' },
  OUTBOUND: { icon: ArrowUpRight, cls: 'bg-rose-500/10 text-rose-500', txt: 'text-rose-500' },
  ADJUSTMENT: { icon: RefreshCw, cls: 'bg-amber-500/10 text-amber-500', txt: 'text-amber-500' },
};

export default function StockMovementPage({ darkMode }) {
  const { can } = useAuth();
  const toast = useToast();
  const t = theme(darkMode);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState(null);
  const [productId, setProductId] = useState('');
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, l] = await Promise.all([api.products({ limit: 100, sort: 'name' }), api.logs({ movements: 'true', limit: 50 })]);
      setProducts(p.data); setLogs(l.logs);
      setProductId((cur) => cur || p.data[0]?.id || '');
    } catch (e) { toast(e.message, 'error'); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const selected = products.find((p) => String(p.id) === String(productId));
  const types = can('Admin', 'Manager') ? ['IN', 'OUT', 'ADJUSTMENT'] : ['IN', 'OUT'];

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.adjustStock({ productId: Number(productId), type, quantity: Number(quantity), note });
      toast(`Saved. New stock: ${r.data.newStock}`);
      setQuantity(1); setNote('');
      await load();
    } catch (err) { toast(err.message, 'error'); } finally { setSaving(false); }
  };

  const f = `${inputBase} ${t.input}`;

  return (
    <div className="space-y-6 inventra-enter">
      <div>
        <h1 className={`text-2xl font-bold ${t.title}`}>Stock Movement & Adjustments</h1>
        <p className={`text-xs ${t.muted} mt-1`}>Record inbound shipments, customer dispatches, or manual stock corrections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border ${t.panel}`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${t.title}`}><ArrowUpRight className="w-4 h-4 text-emerald-500" /> New Adjustment Entry</h3>
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-slate-400 uppercase">Select Product</span>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} className={f}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Current: {p.stock_quantity}</option>)}
              </select>
            </label>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Action Type</span>
              <div className={`grid gap-2 mt-1.5 ${types.length === 3 ? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3' : 'grid-cols-2'}`}>
                {types.map((k) => { const m = TYPES[k]; const Icon = m.icon; return (
                  <button key={k} type="button" onClick={() => setType(k)} className={`py-2.5 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 ${type === k ? m.on : darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    <Icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                ); })}
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-bold text-slate-400 uppercase">{type === 'ADJUSTMENT' ? 'New Stock Count' : 'Quantity Units'}</span>
              <input type="number" min={type === 'ADJUSTMENT' ? 0 : 1} required value={quantity} onChange={(e) => setQuantity(e.target.value)} className={f} />
              {selected && type !== 'ADJUSTMENT' && <span className="text-[11px] text-slate-400">Result: {type === 'IN' ? selected.stock_quantity + Number(quantity || 0) : selected.stock_quantity - Number(quantity || 0)} units</span>}
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-400 uppercase">Note (optional)</span>
              <input value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="e.g. PO #1042, damaged goods" className={f} />
            </label>
            <button type="submit" disabled={saving || !productId} className={`${primaryBtn} w-full py-3`}>{saving && <Loader2 className="w-4 h-4 animate-spin" />}Confirm & Post Adjustment</button>
          </form>
        </div>

        <div className={`lg:col-span-2 p-6 rounded-2xl border ${t.panel}`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${t.title}`}><History className="w-4 h-4 text-emerald-500" /> Recent Audit Activity</h3>
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {!logs && <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mx-auto my-8" />}
            {logs?.length === 0 && <p className="text-xs text-slate-400">No movements recorded yet.</p>}
            {logs?.map((l) => { const u = LOG_UI[l.type]; const Icon = u.icon; return (
              <div key={l.id} className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${u.cls}`}><Icon className="w-4 h-4" /></div>
                  <div className="min-w-0">
                    <p className={`font-bold truncate ${t.title}`}>{l.product_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{l.sku} - by <span className="text-emerald-500">{l.user_name}</span>{l.note ? ` - ${l.note}` : ''}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold ${u.txt}`}>{l.qty > 0 ? `+${l.qty}` : l.qty} Units</p>
                  <p className="text-[10px] text-slate-500">{fmtDate(l.timestamp)}</p>
                </div>
              </div>
            ); })}
          </div>
        </div>
      </div>
    </div>
  );
}
