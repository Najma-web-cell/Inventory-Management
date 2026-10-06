import { useEffect, useState } from 'react';
import { Package, AlertTriangle, Users, Download, Plus, XCircle, Loader2, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { theme, primaryBtn, money, timeAgo } from '../../components/ui/theme';

const TYPE_META = {
  INBOUND: { label: 'Inbound', color: '#13b989', icon: ArrowDownLeft },
  OUTBOUND: { label: 'Outbound', color: '#ee7668', icon: ArrowUpRight },
  ADJUSTMENT: { label: 'Adjustment', color: '#f4c542', icon: RefreshCw },
  CREATE: { label: 'Created', color: '#6d45db', icon: Plus },
  EDIT: { label: 'Edited', color: '#6d45db', icon: RefreshCw },
  DELETE: { label: 'Deleted', color: '#ee7668', icon: XCircle },
};

const Kpi = ({ label, value, sub, icon: Icon, grad }) => (
  <div className={`p-5 rounded-2xl text-white shadow-lg bg-gradient-to-br ${grad}`}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-white/80">{label}</span>
      <span className="p-2 bg-white/15 rounded-xl"><Icon className="w-5 h-5" /></span>
    </div>
    <div className="mt-4 flex items-baseline justify-between gap-2">
      <h3 className="text-3xl font-extrabold">{value}</h3>
      <span className="text-xs font-semibold bg-white/15 px-2 py-0.5 rounded-md">{sub}</span>
    </div>
  </div>
);

export default function DashboardPage({ darkMode, onExport, goTo }) {
  const { can } = useAuth();
  const t = theme(darkMode);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.stats().then(setData).catch((e) => setError(e.message)); }, []);

  if (error) return <p role="alert" className="text-sm font-semibold text-rose-500">{error}</p>;
  if (!data) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-emerald-500" /></div>;

  const { kpi, monthly, breakdown, recent, lowStockItems } = data;
  const totalMoves = breakdown.reduce((s, b) => s + b.count, 0);
  const pie = breakdown.map((b) => ({ name: TYPE_META[b.type].label, value: b.count, color: TYPE_META[b.type].color }));
  const card = `${t.panel} rounded-2xl border`;

  return (
    <div className="space-y-5 inventra-enter">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${card} p-6`}>
        <div>
          <h1 className={`text-2xl font-bold ${t.title}`}>Inventory Analytics & Stock Control</h1>
          <p className={`text-sm ${t.body} mt-1`}>Live inventory metrics, movement trends, and stock auditing.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onExport} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl ${t.ghostBtn}`}><Download className="w-4 h-4" /> Export CSV</button>
          {can('Admin', 'Manager') && <button onClick={() => goTo('products')} className={primaryBtn}><Plus className="w-4 h-4" /> Add Product</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi label="Total SKU Items" value={kpi.total_products} sub={`${kpi.total_units.toLocaleString()} units`} icon={Package} grad="from-violet-500 to-violet-400" />
        <Kpi label="Low Stock Items" value={kpi.low_stock} sub={kpi.low_stock ? 'Action needed' : 'All good'} icon={AlertTriangle} grad="from-blue-500 to-blue-400" />
        <Kpi label="Out of Stock" value={kpi.out_of_stock} sub={kpi.out_of_stock ? 'Critical' : 'None'} icon={XCircle} grad="from-rose-500 to-red-400" />
        <Kpi label="Active Suppliers" value={kpi.active_suppliers} sub={`${kpi.categories} categories`} icon={Users} grad="from-orange-400 to-amber-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.85fr] gap-5">
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div><h2 className={`text-lg font-bold ${t.title}`}>Overview</h2><p className="text-xs text-slate-400">Units received vs dispatched (last 6 months)</p></div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Stock In</span>
              <span className="flex items-center gap-1.5 text-orange-500"><span className="w-2 h-2 rounded-full bg-orange-400" /> Stock Out</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#a1a8bc" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a8bc" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="stock_in" name="Stock In" stroke="#13b989" fill="#13b989" fillOpacity={0.18} strokeWidth={2.5} />
                <Area type="monotone" dataKey="stock_out" name="Stock Out" stroke="#f19a68" fill="#f19a68" fillOpacity={0.16} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 border-t pt-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {[['Inventory Cost Value', money(kpi.cost_value), 'text-rose-500'], ['Retail Value', money(kpi.retail_value), 'text-violet-500'],
              ['Potential Margin', money(kpi.retail_value - kpi.cost_value), 'text-emerald-500'], ['Total Units', kpi.total_units.toLocaleString(), 'text-cyan-500']]
              .map(([l, v, c]) => <div key={l}><p className="text-[10px] text-slate-400">{l}</p><p className={`mt-1 text-sm font-bold ${c}`}>{v}</p></div>)}
          </div>
        </div>

        <div className={`${card} p-5`}>
          <h2 className={`text-lg font-bold ${t.title}`}>Movement Mix</h2>
          <p className="text-xs text-slate-400">All recorded stock movements</p>
          {totalMoves === 0 ? <p className="text-xs text-slate-400 py-16 text-center">No movements yet.</p> : (
            <>
              <div className="relative h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={pie} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={3} cornerRadius={8}>{pie.map((p) => <Cell key={p.name} fill={p.color} stroke="none" />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center pointer-events-none"><p className={`text-2xl font-black ${t.title}`}>{totalMoves}</p><p className="text-[11px] text-slate-400">Movements</p></div>
              </div>
              <div className="flex justify-center gap-4 text-[11px] font-semibold text-slate-500">
                {pie.map((p) => <span key={p.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: p.color }} />{p.name} ({p.value})</span>)}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.4fr] gap-5">
        <div className={`${card} p-5`}>
          <h2 className={`text-lg font-bold ${t.title}`}>Recent Activity</h2>
          <p className="text-xs text-slate-400 mb-4">Latest actions across the workspace</p>
          <div className="space-y-4">
            {recent.length === 0 && <p className="text-xs text-slate-400">No activity yet.</p>}
            {recent.map((r) => {
              const m = TYPE_META[r.type]; const Icon = m.icon;
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: `${m.color}22`, color: m.color }}><Icon className="w-4 h-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${t.title}`}>{m.label}: {r.product_name}</p>
                    <p className="text-[10px] text-slate-400">{r.user_name} - {timeAgo(r.timestamp)}</p>
                  </div>
                  {['INBOUND', 'OUTBOUND', 'ADJUSTMENT'].includes(r.type) && <span className="text-xs font-bold" style={{ color: m.color }}>{r.qty > 0 ? `+${r.qty}` : r.qty}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="p-5"><h2 className={`text-lg font-bold ${t.title}`}>Low Stock Alerts</h2><p className="text-xs text-slate-400">Products at or below their reorder level</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-y text-[10px] uppercase tracking-wider ${t.thead}`}>
                <tr><th className="px-5 py-3">Product</th><th className="px-3 py-3">SKU</th><th className="px-3 py-3">In stock</th><th className="px-3 py-3">Reorder at</th><th className="px-5 py-3">Status</th></tr>
              </thead>
              <tbody className={`divide-y ${t.divide}`}>
                {lowStockItems.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">All products are above their reorder level.</td></tr>}
                {lowStockItems.map((p) => (
                  <tr key={p.id}>
                    <td className={`px-5 py-3 font-semibold ${t.title}`}>{p.name}</td>
                    <td className="px-3 py-3 font-mono text-slate-400">{p.sku}</td>
                    <td className={`px-3 py-3 font-bold ${t.title}`}>{p.stock_quantity}</td>
                    <td className="px-3 py-3 text-slate-500">{p.reorder_level}</td>
                    <td className="px-5 py-3"><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${p.stock_quantity === 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'}`}>{p.stock_quantity === 0 ? 'Out of stock' : 'Low stock'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
