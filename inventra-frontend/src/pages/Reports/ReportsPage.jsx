import { useState } from 'react';
import { Download, FileText, BarChart3, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../components/ui/theme';

const REPORTS = [
  { kind: 'valuation', icon: FileText, color: 'text-emerald-500', title: 'Inventory Valuation', text: 'Stock quantities with total cost value and retail value per product.', btn: 'Download CSV Report' },
  { kind: 'movements', icon: BarChart3, color: 'text-blue-500', title: 'Stock Movement Analytics', text: 'Every inbound, outbound and adjustment with before/after stock levels.', btn: 'Download CSV Dump' },
  { kind: 'audit', icon: ShieldCheck, color: 'text-purple-500', title: 'Compliance & Audit Trail', text: 'All system modifications mapped with user roles and action timestamps.', btn: 'Export Audit Log' },
];

export default function ReportsPage({ darkMode }) {
  const t = theme(darkMode);
  const toast = useToast();
  const [busy, setBusy] = useState('');

  const run = async (kind) => {
    setBusy(kind);
    try { await api.download(kind); toast('Report downloaded'); } catch (e) { toast(e.message, 'error'); } finally { setBusy(''); }
  };

  return (
    <div className="space-y-6 inventra-enter">
      <div>
        <h1 className={`text-2xl font-bold ${t.title}`}>Reports & Data Export Center</h1>
        <p className={`text-sm ${t.muted}`}>Generate stock reports, audit sheets, and analytical data exports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REPORTS.map(({ kind, icon: Icon, color, title, text, btn }) => (
          <div key={kind} className={`border p-6 rounded-2xl ${t.panel}`}>
            <Icon className={`${color} mb-3`} size={28} />
            <h3 className={`text-lg font-bold ${t.title}`}>{title}</h3>
            <p className={`text-xs mt-1 mb-4 ${t.muted}`}>{text}</p>
            <button onClick={() => run(kind)} disabled={!!busy} className={`w-full text-xs font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 disabled:opacity-60 ${t.ghostBtn}`}>
              {busy === kind ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} {btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
