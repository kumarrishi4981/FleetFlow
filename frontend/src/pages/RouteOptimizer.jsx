import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchVehicles, optimizeRoute } from '../services/api';
import { Compass, Play, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

// Custom number icons for waypoints
function createNumberIcon(number) {
  return L.divIcon({
    html: `<div style="background-color: var(--accent-blue); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5); font-size: 0.8rem;">${number}</div>`,
    className: 'custom-number-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createOptimizedIcon(number) {
  return L.divIcon({
    html: `<div style="background-color: var(--accent-emerald); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5); font-size: 0.8rem;">${number}</div>`,
    className: 'custom-number-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function MapEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom]);
  return null;
}

export default function RouteOptimizer() {
  const { theme } = useContext(ThemeContext);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  
  // Map zoom and center states
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState(12);

  // Waypoints entered by user
  const [waypoints, setWaypoints] = useState([]);
  
  // Optimization results
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await fetchVehicles();
        setVehicles((data || []).filter((v) => v.status === 'IDLE' || v.status === 'ACTIVE'));
      } catch (err) {
        console.error(err);
      }
    }
    loadVehicles();
  }, []);

  const handleMapClick = (latlng) => {
    if (result) return; // Reset first if optimized
    const index = waypoints.length + 1;
    const newWaypoint = {
      lat: latlng.lat,
      lng: latlng.lng,
      label: `Stop #${index}`,
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const handleOptimize = async () => {
    if (waypoints.length < 2 || !selectedVehicleId) return;
    setOptimizing(true);
    try {
      const payload = {
        vehicleId: Number(selectedVehicleId),
        waypointLats: waypoints.map((w) => w.lat),
        waypointLngs: waypoints.map((w) => w.lng),
        waypointLabels: waypoints.map((w) => w.label),
      };
      const data = await optimizeRoute(payload);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleReset = () => {
    setWaypoints([]);
    setResult(null);
  };

  // Original coordinates for gray polyline
  const originalPath = waypoints.map((w) => [w.lat, w.lng]);
  
  // Optimized coordinates for green polyline
  const optimizedPath = result
    ? result.optimizedWaypoints.map((w) => [w.lat, w.lng])
    : [];

  return (
    <div className="page-enter" style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h1>Logistics Route Optimizer</h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
          Click anywhere on the map to add delivery waypoints, then let Dijkstra/TSP compute the shortest path.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, flex: 1, minHeight: 0, marginBottom: 12 }}>
        {/* MAP PANEL */}
        <div className="chart-container" style={{ padding: 0, position: 'relative', overflow: 'hidden', height: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            zoomControl={true}
            style={{ width: '100%', height: '100%' }}
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              url={theme === 'light'
                ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            
            <MapEvents onMapClick={handleMapClick} />

            {/* Render original waypoints in blue if not optimized yet */}
            {!result &&
              waypoints.map((wp, i) => (
                <Marker
                  key={i}
                  position={[wp.lat, wp.lng]}
                  icon={createNumberIcon(i + 1)}
                />
              ))}

            {/* Render optimized waypoints in green if optimized */}
            {result &&
              result.optimizedWaypoints.map((wp, i) => (
                <Marker
                  key={i}
                  position={[wp.lat, wp.lng]}
                  icon={createOptimizedIcon(i + 1)}
                />
              ))}

            {/* Render lines */}
            {!result && waypoints.length >= 2 && (
              <Polyline positions={originalPath} color="var(--accent-blue)" weight={3} dashArray="6, 8" />
            )}

            {result && (
              <>
                {/* Gray Original Route */}
                <Polyline positions={originalPath} color="#64748B" weight={2} opacity={0.5} />
                {/* Green Optimized Route */}
                <Polyline positions={optimizedPath} color="var(--accent-emerald)" weight={4} />
              </>
            )}
          </MapContainer>

          <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, display: 'flex', gap: 10 }}>
            <div className="glass-panel" style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }} /> Original Waypoints
            </div>
            {result && (
              <div className="glass-panel" style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} /> Optimized Routing
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS PANEL */}
        <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '100%', overflowY: 'auto' }}>
          <div>
            <label className="form-label">Select Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedVehicleId(val);
                if (val) {
                  const v = vehicles.find((veh) => veh.id === Number(val));
                  if (v) {
                    const lat = v.currentLat ?? v.latitude;
                    const lng = v.currentLng ?? v.longitude;
                    if (lat && lng) {
                      setMapCenter([lat, lng]);
                      setMapZoom(12);
                    }
                  }
                }
              }}
              className="form-input"
              disabled={result}
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} ({v.driverName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>Waypoints ({waypoints.length})</label>
              {waypoints.length > 0 && (
                <button
                  onClick={handleReset}
                  className="btn btn-ghost"
                  style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-rose)' }}
                >
                  <Trash2 size={14} /> Clear
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
              {waypoints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No stops added. Click on the map to add delivery points.
                </div>
              ) : (
                waypoints.map((w, i) => (
                  <div key={i} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: result ? 'var(--accent-emerald)' : 'var(--accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.lat.toFixed(4)}, {w.lng.toFixed(4)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RESULTS CARD */}
          {result && (
            <div className="glass-panel" style={{ padding: 16, borderRadius: 'var(--radius)', border: '1px solid var(--accent-emerald)', background: 'rgba(16,185,129,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: 12 }}>
                <Sparkles size={18} /> Optimization Report
              </div>
              
              <div style={{ textAlign: 'center', padding: '10px 0', marginBottom: 16 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distance Savings</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {result.savingsPercent.toFixed(1)}%
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Original Dist:</span>
                  <span style={{ fontWeight: 600 }}>{result.originalDistanceKm.toFixed(2)} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Optimized Dist:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>{result.optimizedDistanceKm.toFixed(2)} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Est. Duration:</span>
                  <span style={{ fontWeight: 600 }}>{result.estimatedDurationMinutes} mins</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto' }}>
            {!result ? (
              <button
                disabled={waypoints.length < 2 || !selectedVehicleId || optimizing}
                onClick={handleOptimize}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {optimizing ? (
                  <>
                    <RefreshCw size={16} className="spinner" /> Optimizing...
                  </>
                ) : (
                  <>
                    <Play size={16} /> Optimize Route
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="btn btn-ghost"
                style={{ width: '100%', border: '1px solid var(--glass-border)' }}
              >
                Reset Planner
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
