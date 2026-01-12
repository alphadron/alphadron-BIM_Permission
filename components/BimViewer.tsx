import React from 'react';
import { Layers, Cuboid, Expand } from 'lucide-react';

const BimViewer: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl group">
      {/* Simulation of a 3D Viewport */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* 3D Object Representation (CSS) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 perspective-1000">
        <div className="relative w-full h-full transform-style-3d animate-slow-spin">
           {/* Building Block 1 */}
           <div className="absolute inset-x-8 top-8 bottom-32 bg-blue-500/20 border border-blue-400 backdrop-blur-sm transform translate-z-10 shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
           {/* Building Block 2 */}
           <div className="absolute inset-x-4 top-24 bottom-16 bg-indigo-500/20 border border-indigo-400 backdrop-blur-sm transform -translate-z-10"></div>
           {/* Floor Plane */}
           <div className="absolute bottom-0 inset-x-0 h-48 bg-slate-800/40 border border-slate-600 transform rotate-x-90 origin-bottom"></div>
        </div>
      </div>

      {/* Overlay Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="p-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 border border-slate-600" title="Layers">
          <Layers size={18} />
        </button>
        <button className="p-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 border border-slate-600" title="Isolate">
          <Cuboid size={18} />
        </button>
        <button className="p-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 border border-slate-600" title="Fullscreen">
          <Expand size={18} />
        </button>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg p-2 flex justify-between items-center text-xs text-slate-400">
        <div className="flex gap-4">
          <span>Coords: 127.123, 37.567</span>
          <span>EPSG: 3857</span>
          <span>LOD: 300</span>
        </div>
        <div className="flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            IFC Parsed
        </div>
      </div>
    </div>
  );
};

export default BimViewer;
