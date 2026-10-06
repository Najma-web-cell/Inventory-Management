import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/ui/Toast';
import { api } from './services/api';
import LoginPage from './pages/Auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProductsPage from './pages/Products/ProductsPage';
import CategoriesPage from './pages/Categories/CategoriesPage';
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import StockMovementPage from './pages/Stock/StockMovementPage';
import AuditPage from './pages/Audit/AuditPage';
import ReportsPage from './pages/Reports/ReportsPage';

function MainApp() {
  const { user, loading } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('inventra_dark') === '1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b1025]"><Loader2 className="w-8 h-8 text-cyan-300 animate-spin" /></div>;
  }
  if (!user) return <LoginPage />;

  const toggleDark = (v) => { setDarkMode(v); localStorage.setItem('inventra_dark', v ? '1' : '0'); };
  const exportCSV = () => api.download('products').then(() => toast('Inventory exported')).catch((e) => toast(e.message, 'error'));
  const runSearch = (q) => { setGlobalSearch(q); setActiveTab('products'); };
  const page = { darkMode };

  return (
    <div className={`flex min-h-screen antialiased ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[radial-gradient(circle_at_top_right,_#fff5fb,_transparent_32%),linear-gradient(135deg,#f3f5ff_0%,#effaff_52%,#fff8f1_100%)] text-slate-900'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} mobileOpen={mobileSidebarOpen} collapsed={sidebarCollapsed} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onExport={exportCSV}
          onSearch={runSearch}
          onViewStock={() => setActiveTab('products')}
          darkMode={darkMode}
          setDarkMode={toggleDark}
          onMenu={() => (window.innerWidth < 1024 ? setMobileSidebarOpen((o) => !o) : setSidebarCollapsed((c) => !c))}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardPage {...page} onExport={exportCSV} goTo={setActiveTab} />}
          {activeTab === 'products' && <ProductsPage key={globalSearch} initialSearch={globalSearch} {...page} />}
          {activeTab === 'categories' && <CategoriesPage {...page} />}
          {activeTab === 'suppliers' && <SuppliersPage {...page} />}
          {activeTab === 'stock' && <StockMovementPage {...page} />}
          {activeTab === 'history' && <AuditPage {...page} />}
          {activeTab === 'reports' && <ReportsPage {...page} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
