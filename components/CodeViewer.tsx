import React, { useState } from 'react';
import { Download, Check, FileCode, PlayCircle } from 'lucide-react';
import { COLAB_PYTHON_SCRIPT } from '../constants';

const CodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([COLAB_PYTHON_SCRIPT], {type: 'text/x-python'});
    element.href = URL.createObjectURL(file);
    element.download = "modular_platform_check.py";
    document.body.appendChild(element); 
    element.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded text-yellow-500">
             <FileCode size={20} />
          </div>
          <div>
            <h3 className="text-white font-medium">Core Logic: Python Backend</h3>
            <p className="text-xs text-slate-400">Ready for Google Colab • IfcOpenShell + Shapely</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {copied ? <Check size={16} /> : <Download size={16} />}
          {copied ? 'Downloaded' : 'Download .py'}
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-[#0d1117] p-6 font-mono text-sm relative">
         <div className="absolute top-4 right-6 flex gap-2">
            <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">Python 3.9+</span>
            <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">FastAPI Compatible</span>
         </div>
        <pre className="text-slate-300 leading-relaxed">
          <code>
            {COLAB_PYTHON_SCRIPT.split('\n').map((line, i) => (
                <div key={i} className="table-row">
                    <span className="table-cell select-none text-slate-600 text-right pr-4 w-10 border-r border-slate-800 mr-4">{i + 1}</span>
                    <span className="table-cell pl-4 whitespace-pre-wrap break-all">
                        {/* Basic Syntax Highlighting Simulation */}
                        {line.startsWith('#') ? (
                            <span className="text-green-600/80">{line}</span>
                        ) : line.includes('class ') ? (
                             <span><span className="text-purple-400">class</span> {line.replace('class ', '')}</span>
                        ) : line.includes('def ') ? (
                             <span><span className="text-blue-400">def</span> {line.replace('def ', '')}</span>
                        ) : line.includes('import ') ? (
                             <span className="text-pink-400">{line}</span>
                        ) : (
                            line
                        )}
                    </span>
                </div>
            ))}
          </code>
        </pre>
      </div>
      
      <div className="bg-slate-800 border-t border-slate-700 p-3 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-2">
              <PlayCircle size={14} className="text-green-500"/>
              <span>Recommended Environment: Google Colab / Jupyter Notebook</span>
          </div>
          <span>Lines: {COLAB_PYTHON_SCRIPT.split('\n').length}</span>
      </div>
    </div>
  );
};

export default CodeViewer;
