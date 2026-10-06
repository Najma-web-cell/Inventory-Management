import { AlertTriangle, CheckCircle } from 'lucide-react';
import { stockStatus } from './theme';

export default function StatusBadge({ product }) {
  const s = stockStatus(product);
  const cls = { ok: 'bg-emerald-500/10 text-emerald-600', low: 'bg-amber-500/10 text-amber-600', out: 'bg-rose-500/10 text-rose-500' }[s];
  const label = { ok: `${product.stock_quantity} units`, low: `Low: ${product.stock_quantity} left`, out: 'Out of Stock' }[s];
  const Icon = s === 'ok' ? CheckCircle : AlertTriangle;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cls}`}><Icon className="w-3.5 h-3.5" /> {label}</span>;
}
