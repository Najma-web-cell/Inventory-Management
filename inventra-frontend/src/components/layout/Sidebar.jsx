import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Tags, 
  Users, 
  History, 
  FileSpreadsheet
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, mobileOpen, collapsed, onClose }) => {
  const navigation = [
    {
      group: 'Core Management',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products & Catalog', icon: Package },
        { id: 'categories', label: 'Categories', icon: Tags },
        { id: 'suppliers', label: 'Suppliers', icon: Users },
      ]
    },
    {
      group: 'Inventory Ops',
      items: [
        { id: 'stock', label: 'Stock Movement', icon: ArrowLeftRight },
        { id: 'history', label: 'Audit & History', icon: History },
        { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
      ]
    }
  ];

  return (
    <>
      {mobileOpen && <button type="button" aria-label="Close navigation menu" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[76px] bg-gradient-to-b from-[#282262] via-[#3b2d83] to-[#214d79] text-slate-300 px-3 py-4 flex flex-col justify-between border-r border-white/10 select-none shadow-2xl shadow-indigo-950/20 transition-transform duration-200 lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:hidden' : ''}`}>
      <div>
        {/* Header Branding */}
        <div className="flex items-center justify-center px-1 py-2 mb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-300 to-emerald-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-400/20">
            I
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {navigation.map((sec, idx) => (
            <div key={idx}>
              <nav className="space-y-2">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); onClose(); }}
                      title={item.label}
                      className={`group relative w-full flex items-center justify-center px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-300/20 text-white font-semibold border border-cyan-200/30 shadow-sm shadow-cyan-950/10'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                      <span className="pointer-events-none absolute left-[58px] z-20 hidden whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-[11px] font-semibold text-white shadow-xl group-hover:block">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* System Operational Badge */}
      <div className="p-2 bg-white/10 border border-white/10 rounded-xl backdrop-blur-xl flex justify-center" title="Database node active">
        <div className="flex items-center justify-center text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;