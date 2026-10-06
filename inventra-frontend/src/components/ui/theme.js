// One place for light/dark classes so every page looks consistent in both modes.
export const theme = (dark) => ({
  panel: dark ? 'bg-slate-900 border-slate-800' : 'bg-white/80 border-white/80 backdrop-blur-xl shadow-[0_16px_40px_rgba(92,84,170,0.10)]',
  title: dark ? 'text-slate-100' : 'text-slate-800',
  muted: dark ? 'text-slate-400' : 'text-slate-500',
  body: dark ? 'text-slate-300' : 'text-slate-600',
  input: dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400',
  thead: dark ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50/80 border-slate-100 text-slate-400',
  divide: dark ? 'divide-slate-800' : 'divide-slate-100',
  hover: dark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70',
  ghostBtn: dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  iconBtn: dark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100',
});

export const primaryBtn = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed';
export const inputBase = 'w-full mt-1 rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-emerald-500';

export const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtDate = (d) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const timeAgo = (d) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d)) / 1000));
  const steps = [[86400, 'day'], [3600, 'hr'], [60, 'min']];
  for (const [sec, label] of steps) if (s >= sec) { const n = Math.floor(s / sec); return `${n} ${label}${n > 1 && label === 'day' ? 's' : ''} ago`; }
  return 'just now';
};

export const stockStatus = (p) => {
  if (p.stock_quantity === 0) return 'out';
  if (p.stock_quantity <= p.reorder_level) return 'low';
  return 'ok';
};
