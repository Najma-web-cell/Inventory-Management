import { useEffect } from 'react';
import { X } from 'lucide-react';
import { theme } from './theme';

export default function Modal({ title, onClose, darkMode, children, wide }) {
  const t = theme(darkMode);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'} max-h-[92vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-lg font-bold ${t.title}`}>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className={`p-1 rounded-lg ${t.iconBtn}`}><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Field = ({ label, children, darkMode }) => (
  <label className="block">
    <span className={`text-[11px] font-bold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
    {children}
  </label>
);

export const confirmDelete = (what) => window.confirm(`Delete ${what}? This cannot be undone.`);
