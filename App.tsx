import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AnalysisDashboard from './components/AnalysisDashboard';
import CodeViewer from './components/CodeViewer';
import GisView from './components/GisView';
import { ViewState } from './types';
import { UploadCloud } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('analysis');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center max-w-md">
                <UploadCloud size={48} className="mx-auto text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Upload IFC Model</h2>
                <p className="mb-6">Start by uploading a .ifc file to analyze building codes and run simulations.</p>
                <button 
                  onClick={() => setCurrentView('analysis')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                  Load Demo Project
                </button>
             </div>
          </div>
        );
      case 'analysis':
        return <AnalysisDashboard />;
      case 'code':
        return <CodeViewer />;
      case 'gis':
        return <GisView />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center px-6 justify-between">
            <h2 className="text-lg font-semibold text-white capitalize">
              {currentView === 'analysis' ? 'BIM Compliance Check' : 
               currentView === 'code' ? 'Developer Hub' : 
               currentView === 'gis' ? 'GIS Integration' : 
               'Project Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
               <div className="text-xs text-slate-400">
                 <span className="text-slate-500">Last run:</span> Today, 10:24 AM
               </div>
               <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-slate-700"></div>
            </div>
        </header>

        <div className="flex-1 overflow-hidden p-6 relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
