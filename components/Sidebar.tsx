import React from 'react';
import { LayoutDashboard, FileCode, Map, ShieldCheck, FileInput } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'analysis', label: 'BIM Check', icon: <ShieldCheck size={20} /> },
    { id: 'gis', label: 'GIS View', icon: <Map size={20} /> },
    { id: 'code', label: 'Dev Hub', icon: <FileCode size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          ModularPlatform
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">BIM-GIS Engine</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === item.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
            <FileInput size={14} />
            <span>Active Project</span>
          </div>
          <div className="text-xs text-slate-500 truncate">
            modular_housing_a.ifc
          </div>
          <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
             Engine Ready
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
