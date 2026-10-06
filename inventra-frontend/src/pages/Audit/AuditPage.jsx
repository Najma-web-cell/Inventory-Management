import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, User, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { theme, fmtDate } from '../../components/ui/theme';

const META = {
  INBOUND: ['bg-emerald-500/10 text-emerald-600', ArrowDownLeft], OUTBOUND: ['bg-rose-500/10 text-rose-500', ArrowUpRight],
  ADJUSTMENT: ['bg-amber-500/10 text-amber-600', RefreshCw], CREATE: ['bg-violet-500/10 text-violet-600', Plus],
  EDIT: ['bg-sky-500/10 text-sky-600', Pencil], DELETE: ['bg-rose-500/10 text-rose-500', Trash2],
};

export default function AuditPage({ darkMode }) {
  const t = theme(darkMode);
  const toast = useToast();
  const [logs, setLogs] = useState(null);

  useEffect(() => { api.logs({ limit: 200 }).then((r) => setLogs(r.logs)).catch((e) => toast(e.message, 'error')); }, [toast]);

  return (
    <div className="space-y-6 inventra-enter">
      <div>
        <h1 className={`text-2xl font-bold ${t.title}`}>System Audit & Inventory Logs</h1>
        <p className={`text-sm ${t.muted}`}>Complete record of all stock movements and product changes (latest 200)</p>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${t.panel}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase border-b ${t.thead}`}>
              <tr><th className="p-4">Log ID</th><th className="p-4">Product Details</th><th className="p-4">Action</th><th className="p-4">Quantity Change</th><th className="p-4">Action By</th><th className="p-4">Timestamp</th></tr>
            </thead>
            <tbody className={`divide-y ${t.divide}`}>
              {!logs && <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-emerald-500" /></td></tr>}
              {logs?.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-400">No audit records yet.</td></tr>}
              {logs?.map((l) => { const [cls, Icon] = META[l.type]; const isMove = ['INBOUND', 'OUTBOUND', 'ADJUSTMENT'].includes(l.type); return (
                <tr key={l.id} className={t.hover}>
                  <td className="p-4 font-mono text-emerald-500">{l.id}</td>
                  <td className="p-4"><p className={`font-semibold ${t.title}`}>{l.product_name}</p><p className="text-[11px] text-slate-400 font-mono">{l.sku}</p></td>
                  <td className="p-4"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}><Icon size={14} /> {l.type}</span></td>
                  <td className={`p-4 font-bold ${t.title}`}>{isMove ? (l.qty > 0 ? `+${l.qty}` : l.qty) : '-'}{isMove && l.new_stock != null && <span className="ml-2 text-[11px] font-normal text-slate-400">({l.previous_stock} to {l.new_stock})</span>}</td>
                  <td className={`p-4 ${t.body}`}><span className="inline-flex items-center gap-2"><User size={14} className="text-emerald-500" /> {l.user_name}{l.user_role && <span className="text-[10px] text-slate-400">({l.user_role})</span>}</span></td>
                  <td className="p-4 text-xs text-slate-400 whitespace-nowrap">{fmtDate(l.timestamp)}</td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
