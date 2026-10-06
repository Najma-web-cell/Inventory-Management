import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Search, Bell, Download, Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onExport, onSearch, onViewStock, darkMode, setDarkMode, onMenu }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.stats().then((r) => setAlerts(r.lowStockItems)).catch(() => {});
  }, [showNotifications]);

  return (
    <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors backdrop-blur-xl ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white/70 border-white/80 text-slate-800 shadow-sm'
    }`}>
      {/* Search Bar */}
      <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
        <button type="button" onClick={onMenu} aria-label="Toggle navigation menu" className={`p-2 rounded-xl ${darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}>
          <Menu className="w-5 h-5" />
        </button>
        <form className="relative w-full sm:w-72 lg:w-96" onSubmit={(e) => { e.preventDefault(); onSearch(query.trim()); }}>
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search products or SKU, then press Enter..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full rounded-xl pl-10 pr-4 py-2 text-sm transition-all focus:outline-none ${
            darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50/80 border-slate-100 text-slate-800 focus:border-cyan-500 shadow-inner'
          }`}
        />
        </form>
      </div>

      {/* Actions & Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`hidden sm:block p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button 
          onClick={onExport}
          className={`hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
            darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white/60 hover:bg-white text-slate-700 border border-white/70'
          }`}
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>

        <div className="hidden sm:block h-6 w-[1px] bg-slate-700 mx-1"></div>

        {/* Notifications Popover */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl relative transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2"></span>}
          </button>

          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border p-4 z-50 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Notifications</h4>
              <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                {alerts.length === 0 && <p className="text-slate-400">No stock alerts. Everything is healthy.</p>}
                {alerts.map((a) => (
                  <button key={a.id} onClick={() => { setShowNotifications(false); onViewStock(); }} className={`w-full text-left p-2.5 rounded-xl border ${a.stock_quantity === 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'}`}>
                    <p className="font-semibold">{a.stock_quantity === 0 ? 'Out of stock' : 'Low stock'}</p>
                    <p className="text-[11px] opacity-80">{a.name} - {a.stock_quantity} left (reorder at {a.reorder_level})</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-none">{user?.name}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">{user?.role} Access</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border p-2 z-50 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="px-3 py-2 border-b border-slate-700/50">
                <p className="text-xs font-bold">Inventra Workspace</p>
                <p className="text-[10px] text-slate-400">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;