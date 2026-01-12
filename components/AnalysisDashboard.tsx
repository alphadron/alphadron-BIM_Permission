import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Activity, Box } from 'lucide-react';
import { APP_RULES, MOCK_BIM_STATS } from '../constants';
import BimViewer from './BimViewer';

const AnalysisDashboard: React.FC = () => {
  const [activeRule, setActiveRule] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      
      {/* Left Col: Rules List */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Stats Card */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Model Health</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-3 rounded-lg">
                    <div className="text-slate-400 text-xs mb-1">Compliance</div>
                    <div className="text-2xl font-bold text-green-400">{MOCK_BIM_STATS.complianceRate}%</div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg">
                    <div className="text-slate-400 text-xs mb-1">Elements</div>
                    <div className="text-2xl font-bold text-white">{MOCK_BIM_STATS.totalElements}</div>
                </div>
            </div>
            <div className="mt-4 flex gap-2 text-xs">
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded flex items-center gap-1">
                    <XCircle size={12} /> {MOCK_BIM_STATS.errors} Errors
                </span>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded flex items-center gap-1">
                    <AlertTriangle size={12} /> {MOCK_BIM_STATS.warnings} Warnings
                </span>
            </div>
        </div>

        {/* Rules Engine List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                 <h3 className="text-white font-semibold flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" />
                    Active Rulesets
                 </h3>
                 <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">v1.2</span>
            </div>
            <div className="overflow-y-auto p-2 space-y-2">
                {APP_RULES.map((rule) => (
                    <div 
                        key={rule.id}
                        onClick={() => setActiveRule(rule.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                            activeRule === rule.id 
                            ? 'bg-blue-600/20 border-blue-500/50' 
                            : 'bg-slate-700/30 border-transparent hover:bg-slate-700'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                rule.category === 'Safety' ? 'bg-red-500/20 text-red-400' :
                                rule.category === 'Legal' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-slate-600 text-slate-300'
                            }`}>
                                {rule.category}
                            </span>
                            {activeRule === rule.id && <ArrowRight size={14} className="text-blue-400" />}
                        </div>
                        <h4 className="text-slate-200 font-medium text-sm">{rule.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rule.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right Col: Viewer & Detail */}
      <div className="lg:col-span-2 flex flex-col gap-6">
         {/* 3D Viewer Container */}
         <div className="flex-1 min-h-[400px]">
             <BimViewer />
         </div>

         {/* Rule Detail / Logger */}
         <div className="h-48 bg-slate-900 rounded-xl border border-slate-700 p-4 overflow-y-auto font-mono text-sm">
             <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">System Log</div>
             <div className="space-y-1">
                 <div className="text-green-400 flex gap-2">
                    <span>[10:23:41]</span> <span>System initialized. IfcOpenShell loaded.</span>
                 </div>
                 <div className="text-slate-300 flex gap-2">
                    <span>[10:23:42]</span> <span>Parsing 'modular_housing_a.ifc' (14MB)... Done.</span>
                 </div>
                 {activeRule ? (
                     <div className="text-blue-400 flex gap-2 animate-pulse">
                        <span>[Now]</span> <span>Running analysis: {APP_RULES.find(r => r.id === activeRule)?.name}...</span>
                     </div>
                 ) : (
                     <div className="text-slate-500 italic">Select a rule to view analysis details...</div>
                 )}
                  <div className="text-yellow-400 flex gap-2">
                    <span>[10:24:05]</span> <span>Warning: ID #4023 (Corridor) width 1150mm &lt; 1200mm.</span>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
