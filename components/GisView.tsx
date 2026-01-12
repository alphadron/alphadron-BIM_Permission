import React, { useEffect, useRef, useState } from 'react';
import { Map as MapIcon, ZoomIn, ZoomOut, Layers, Search, Navigation, Building2, Settings, X, Check, Key, Sliders } from 'lucide-react';
import L from 'leaflet';

const GisView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);
  
  // Layer References
  const layersRef = useRef<{
      osm: L.TileLayer | null;
      vworldBase: L.TileLayer | null;
      vworldSat: L.TileLayer | null;
      vworldHybrid: L.TileLayer | null;
      cadastral: L.TileLayer.WMS | null;
  }>({ osm: null, vworldBase: null, vworldSat: null, vworldHybrid: null, cadastral: null });

  // State
  const [searchText, setSearchText] = useState('');
  const [currentLocationName, setCurrentLocationName] = useState('Gwanghwamun, Seoul');
  const [coords, setCoords] = useState<{lat: number, lng: number}>({ lat: 37.570705, lng: 126.976936 });
  const [isLoading, setIsLoading] = useState(false);
  
  // UI State
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Map Configuration State
  const [baseLayer, setBaseLayer] = useState<'osm' | 'vworld_base' | 'vworld_sat'>('vworld_base');
  const [showCadastral, setShowCadastral] = useState(true);
  const [cadastralOpacity, setCadastralOpacity] = useState(0.7);
  const [vworldKey, setVworldKey] = useState(() => localStorage.getItem('vworld_key') || '');
  const [tempKey, setTempKey] = useState('');

  // Save key to local storage
  const handleSaveKey = () => {
    localStorage.setItem('vworld_key', tempKey);
    setVworldKey(tempKey);
    setIsSettingsOpen(false);
    if (tempKey) setBaseLayer('vworld_base'); // Auto-switch if key provided
  };

  useEffect(() => {
    setTempKey(vworldKey);
    if (!vworldKey) setBaseLayer('osm'); // Fallback if no key
  }, [vworldKey]);

  // Custom Icon Definition
  const getCustomIcon = () => {
    const svgIcon = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `;
    return L.divIcon({
      className: 'bg-transparent border-none',
      html: `<div style="transform: translate(-50%, -100%); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">${svgIcon}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  };

  // Helper to generate popup HTML
  const getPopupContent = (name: string) => {
    return `
      <div class="text-sm font-sans">
        <div class="font-bold text-slate-800 mb-1">Target Site</div>
        <div class="text-xs text-slate-600 border-t pt-1 border-slate-200">${name}</div>
        <div class="text-[10px] text-blue-600 mt-1">BIM Project Location</div>
      </div>
    `;
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Strict Cleanup
    if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        crs: L.CRS.EPSG3857 
    }).setView([coords.lat, coords.lng], 17);

    mapInstanceRef.current = map;
    
    // Marker
    const marker = L.marker([coords.lat, coords.lng], { icon: getCustomIcon() })
        .addTo(map)
        .bindPopup(getPopupContent(currentLocationName))
        .openPopup();
    markerInstanceRef.current = marker;

    setTimeout(() => map.invalidateSize(), 100);
    updateLayers(map);

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 2. Layer Management
  const updateLayers = (map: L.Map) => {
      const { osm, vworldBase, vworldSat, vworldHybrid, cadastral } = layersRef.current;
      [osm, vworldBase, vworldSat, vworldHybrid, cadastral].forEach(l => l && map.removeLayer(l));

      // Define Layers with specific Z-Indices
      if (!layersRef.current.osm) {
        layersRef.current.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            maxZoom: 19, 
            attribution: 'OSM',
            zIndex: 1 
        });
      }

      if (vworldKey) {
        if (!layersRef.current.vworldBase) {
             layersRef.current.vworldBase = L.tileLayer(`https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/{z}/{y}/{x}.png`, { 
                 maxZoom: 19, 
                 attribution: 'V-World',
                 zIndex: 1
             });
        }
        if (!layersRef.current.vworldSat) {
             layersRef.current.vworldSat = L.tileLayer(`https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Satellite/{z}/{y}/{x}.jpeg`, { 
                 maxZoom: 19, 
                 attribution: 'V-World',
                 zIndex: 1
             });
             layersRef.current.vworldHybrid = L.tileLayer(`https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Hybrid/{z}/{y}/{x}.png`, { 
                 maxZoom: 19, 
                 attribution: 'V-World',
                 zIndex: 20 // Labels on top
             });
        }
        
        // Cadastral (Jijeokdo) WMS
        // Using explicit WMS parameters for V-World
        if (!layersRef.current.cadastral) {
            layersRef.current.cadastral = L.tileLayer.wms(`https://api.vworld.kr/req/wms?`, {
                layers: 'lp_pa_cbnd_bubun,lp_pa_cbnd_bonbun', 
                styles: 'lp_pa_cbnd_bubun,lp_pa_cbnd_bonbun',
                format: 'image/png',
                transparent: true,
                version: '1.3.0', // WMS version
                crs: L.CRS.EPSG3857,
                key: vworldKey,
                domain: window.location.hostname,
                opacity: cadastralOpacity,
                zIndex: 10, // Between Base (1) and Labels (20)
                uppercase: true // Leaflet option to uppercase params just in case
            } as any);
        }
      }

      // Apply Base Layer
      if (baseLayer === 'osm') {
          layersRef.current.osm?.addTo(map);
      } else if (vworldKey) {
          if (baseLayer === 'vworld_base') layersRef.current.vworldBase?.addTo(map);
          if (baseLayer === 'vworld_sat') {
              layersRef.current.vworldSat?.addTo(map);
              // Hybrid added later to be on top of Cadastral
          }
      } else {
          layersRef.current.osm?.addTo(map); // Fallback
      }

      // Apply Cadastral Overlay
      if (showCadastral && vworldKey && layersRef.current.cadastral) {
          // Force update opacity
          layersRef.current.cadastral.setOpacity(cadastralOpacity);
          // Set key again in case it changed
          layersRef.current.cadastral.setParams({ key: vworldKey, domain: window.location.hostname } as any);
          layersRef.current.cadastral.addTo(map);
      }

      // Add Hybrid (Labels) last if Satellite is active, to ensure it's on top of Jijeokdo
      if (vworldKey && baseLayer === 'vworld_sat' && layersRef.current.vworldHybrid) {
          layersRef.current.vworldHybrid.addTo(map);
      }
  };

  // 3. React to State Changes
  useEffect(() => {
      if (mapInstanceRef.current) {
          updateLayers(mapInstanceRef.current);
      }
  }, [baseLayer, showCadastral, cadastralOpacity, vworldKey]);

  // 4. Update Map Logic
  const updateMapLocation = (lat: number, lng: number, name: string) => {
    if (!mapInstanceRef.current) return;
    
    // Strict number conversion
    const safeLat = parseFloat(lat.toString());
    const safeLng = parseFloat(lng.toString());

    if (isNaN(safeLat) || isNaN(safeLng)) {
        alert("Invalid coordinates received.");
        return;
    }

    setCoords({ lat: safeLat, lng: safeLng });
    setCurrentLocationName(name);

    mapInstanceRef.current.flyTo([safeLat, safeLng], 18, { 
        duration: 1.5,
        easeLinearity: 0.25
    });
    
    if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([safeLat, safeLng]);
        markerInstanceRef.current.bindPopup(getPopupContent(name)).openPopup();
    } else {
        markerInstanceRef.current = L.marker([safeLat, safeLng], { icon: getCustomIcon() })
            .addTo(mapInstanceRef.current)
            .bindPopup(getPopupContent(name))
            .openPopup();
    }
  };

  // 5. Advanced Search Logic (V-World Priority)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchText.trim()) return;

    setIsLoading(true);

    // Strategy: Use V-World API if Key exists (Best for Jibun), else Nominatim
    if (vworldKey) {
        try {
            const query = encodeURIComponent(searchText);
            // Request V-World Search API
            const url = `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:4326&size=1&page=1&query=${query}&type=address&category=parcel&format=json&errorformat=json&key=${vworldKey}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.response.status === "OK" && data.response.result?.items?.length > 0) {
                const item = data.response.result.items[0];
                const lat = item.point.y; 
                const lng = item.point.x;
                const addr = item.address.road || item.address.parcel || searchText;
                
                updateMapLocation(lat, lng, addr);
                setIsLoading(false);
                return; // Success
            } 
        } catch (error) {
            console.warn("V-World search failed, falling back to OSM...", error);
        }
    }

    // Fallback: OSM Nominatim
    try {
      const query = encodeURIComponent(searchText);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const result = data[0];
        updateMapLocation(result.lat, result.lon, result.display_name.split(',')[0]);
      } else {
        alert(`Location '${searchText}' not found via ${vworldKey ? 'V-World' : 'OSM'}. \nTry entering 'Dong + Bunji' format.`);
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please check network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromBim = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Demo Data
      const mockBimAddress = { lat: 37.5126, lng: 127.1025, name: "Seoul, Songpa-gu, Olympic-ro 300" };
      updateMapLocation(mockBimAddress.lat, mockBimAddress.lng, mockBimAddress.name);
      setSearchText(mockBimAddress.name);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="relative w-full h-full bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex flex-col">
       
       {/* Top Bar */}
       <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row gap-3 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur p-3 rounded-lg border border-slate-700 shadow-xl flex items-center gap-3 pointer-events-auto min-w-[200px]">
             <div className="bg-blue-600 p-2 rounded-lg text-white">
                <MapIcon size={20} />
             </div>
             <div>
                <h3 className="text-white text-sm font-semibold">GIS Integration</h3>
                <p className="text-xs text-slate-400">EPSG: 3857 (Web Mercator)</p>
             </div>
          </div>

          <div className="flex-1 pointer-events-auto">
            <form onSubmit={handleSearch} className="relative group">
              <input 
                type="text" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={vworldKey ? "Search Jibun (e.g., Samsung-dong 123-4)" : "Search Address (API Key needed)"}
                className="w-full h-12 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg pl-10 pr-24 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-xl"
              />
              <Search className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500" size={20} />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          <button 
            onClick={handleSyncFromBim}
            className="pointer-events-auto h-12 px-4 bg-slate-900/90 backdrop-blur border border-slate-700 hover:border-green-500 hover:text-green-400 text-slate-300 rounded-lg font-medium shadow-xl flex items-center gap-2 transition-all"
          >
            <Building2 size={18} />
            <span className="text-sm hidden md:inline">From BIM</span>
          </button>
       </div>

       {/* Map Container */}
       <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-900" />
       
       {/* Settings Modal */}
       {isSettingsOpen && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6 pointer-events-auto">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Settings className="text-blue-500" /> GIS Configuration
                    </h3>
                    <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">V-World API Key</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder="Enter API Key (vworld.kr)"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-blue-500 outline-none font-mono text-sm"
                            />
                            <Key className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            Required for <strong>Cadastral Maps (Jijeokdo)</strong> and accurate <strong>Jibun</strong> search.
                            <br />
                            <a href="https://www.vworld.kr/dev/v4dv_apikey_guide_s001.do" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Get Free Key from V-World</a>
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white text-sm">Cancel</button>
                    <button onClick={handleSaveKey} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg text-sm">
                        Save Settings
                    </button>
                </div>
            </div>
         </div>
       )}

       {/* Floating Action Buttons */}
       <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-10 pointer-events-auto items-end">
          
          {/* Layer Menu */}
          {isLayerMenuOpen && (
              <div className="mb-2 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-2xl w-72 animate-in slide-in-from-right-10 fade-in duration-200">
                  <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white text-xs font-bold uppercase tracking-wider">Map Layers</h3>
                      <button onClick={() => setIsLayerMenuOpen(false)} className="text-slate-400 hover:text-white"><X size={14} /></button>
                  </div>

                  {/* Base Maps */}
                  <div className="space-y-1 mb-4">
                      <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Base Layer</div>
                      <button onClick={() => setBaseLayer('osm')} className={`w-full text-left px-3 py-2 rounded text-xs flex justify-between items-center ${baseLayer === 'osm' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'hover:bg-slate-800 text-slate-300'}`}>
                          OpenStreetMap {baseLayer === 'osm' && <Check size={14} />}
                      </button>
                      <button onClick={() => setBaseLayer('vworld_base')} disabled={!vworldKey} className={`w-full text-left px-3 py-2 rounded text-xs flex justify-between items-center ${baseLayer === 'vworld_base' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'hover:bg-slate-800 text-slate-300'} ${!vworldKey && 'opacity-50 cursor-not-allowed'}`}>
                          V-World 2D {baseLayer === 'vworld_base' && <Check size={14} />}
                      </button>
                      <button onClick={() => setBaseLayer('vworld_sat')} disabled={!vworldKey} className={`w-full text-left px-3 py-2 rounded text-xs flex justify-between items-center ${baseLayer === 'vworld_sat' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'hover:bg-slate-800 text-slate-300'} ${!vworldKey && 'opacity-50 cursor-not-allowed'}`}>
                          V-World Satellite {baseLayer === 'vworld_sat' && <Check size={14} />}
                      </button>
                  </div>

                  {/* Overlays */}
                  <div className="pt-3 border-t border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase flex justify-between">
                        <span>Overlay</span>
                        {showCadastral && <span className="text-green-400">Active</span>}
                      </div>
                      
                      <button onClick={() => setShowCadastral(!showCadastral)} disabled={!vworldKey} className={`w-full text-left px-3 py-2 rounded text-xs flex justify-between items-center mb-2 ${showCadastral ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-300'} ${!vworldKey && 'opacity-50 cursor-not-allowed'}`}>
                          <span>Cadastral (Jijeokdo)</span>
                          {showCadastral && <Check size={14} />}
                      </button>

                      {showCadastral && vworldKey && (
                        <div className="px-2 pb-2">
                             <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Opacity</span>
                                <span>{Math.round(cadastralOpacity * 100)}%</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <Sliders size={12} className="text-slate-500"/>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1"
                                    value={cadastralOpacity}
                                    onChange={(e) => setCadastralOpacity(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                             </div>
                        </div>
                      )}

                      {!vworldKey && <p className="text-[10px] text-red-400 mt-2 text-center bg-red-900/20 py-1 rounded">API Key Required for V-World</p>}
                  </div>
              </div>
          )}

          <div className="flex flex-col gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="bg-slate-800 p-2 rounded-lg text-white hover:bg-blue-600 transition shadow-lg border border-slate-700" title="Settings / API Key">
                <Settings size={20} />
            </button>
            <div className="h-px bg-slate-700 my-1"></div>
            <button onClick={() => mapInstanceRef.current?.zoomIn()} className="bg-slate-800 p-2 rounded-lg text-white hover:bg-blue-600 transition shadow-lg border border-slate-700"><ZoomIn size={20} /></button>
            <button onClick={() => mapInstanceRef.current?.zoomOut()} className="bg-slate-800 p-2 rounded-lg text-white hover:bg-blue-600 transition shadow-lg border border-slate-700"><ZoomOut size={20} /></button>
            <button onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)} className={`p-2 rounded-lg transition shadow-lg border border-slate-700 ${isLayerMenuOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white hover:bg-blue-600'}`}>
                <Layers size={20} />
            </button>
          </div>
       </div>
    </div>
  );
};

export default GisView;