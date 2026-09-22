import { useState, useEffect, useRef, useContext } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Eye, EyeOff, X, Filter, MapPin } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { fetchVehicles, fetchOrders, fetchRoutes } from '../services/api';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';
import VehicleMarker from '../components/VehicleMarker';
import OrderMarker from '../components/OrderMarker';
import RoutePolyline from '../components/RoutePolyline';
import StatusBadge from '../components/StatusBadge';

// Helper component to pan Leaflet map dynamically
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
    }
  }, [center, zoom]);
  return null;
}

// Helper component to fit map bounds to cover all vehicles on load
function FitBounds({ vehicles }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !hasFitted.current) {
      const bounds = vehicles
        .map(v => {
          const lat = v.currentLat ?? v.latitude;
          const lng = v.currentLng ?? v.longitude;
          return lat && lng ? [lat, lng] : null;
        })
        .filter(Boolean);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        hasFitted.current = true;
      }
    }
  }, [vehicles, map]);

  return null;
}

export default function FleetMap() {
  const { theme } = useContext(ThemeContext);
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showPanel, setShowPanel] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  // States for map focusing
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(12);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        fetchVehicles(),
        fetchOrders(),
        fetchRoutes(),
      ]);
      if (results[0].status === 'fulfilled') setVehicles(results[0].value || []);
      if (results[1].status === 'fulfilled') setOrders(results[1].value || []);
      if (results[2].status === 'fulfilled') setRoutes(results[2].value || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    connectWebSocket((data) => {
      setVehicles((prev) =>
        prev.map((v) => (v.id === data.id ? { ...v, ...data } : v))
      );
    });

    return () => disconnectWebSocket();
  }, []);

  const handleVehicleClick = (v) => {
    setSelectedVehicle(v);
    const lat = v.currentLat ?? v.latitude;
    const lng = v.currentLng ?? v.longitude;
    if (lat && lng) {
      setMapCenter([lat, lng]);
      setMapZoom(13);
    }
  };

  const filteredVehicles = filter === 'ALL'
    ? vehicles
    : vehicles.filter((v) => v.status === filter);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span>Loading Fleet Map...</span>
      </div>
    );
  }

  const selectedVehicleLat = selectedVehicle ? (selectedVehicle.currentLat ?? selectedVehicle.latitude) : null;
  const selectedVehicleLng = selectedVehicle ? (selectedVehicle.currentLng ?? selectedVehicle.longitude) : null;

  return (
    <div className="fleet-map-page" style={{ position: 'relative', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      {/* Overlay Panel */}
      <div className={`map-overlay-panel ${!showPanel ? 'hidden' : ''}`}>
        <div className="map-panel-header">
          <h3>Fleet Tracker</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              className="form-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: 120, padding: '6px 10px', fontSize: '0.8rem' }}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="IDLE">Idle</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
            <button className="btn btn--ghost btn--icon" onClick={() => setShowPanel(false)}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: '8px 0', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className={`map-vehicle-item ${selectedVehicle?.id === v.id ? 'active' : ''}`}
              onClick={() => handleVehicleClick(v)}
            >
              <div
                className="vehicle-dot"
                style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: v.status === 'ACTIVE' ? '#10B981' : v.status === 'IDLE' ? '#F59E0B' : '#EF4444',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{v.plateNumber}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.driverName || 'No driver'}</div>
              </div>
              <StatusBadge status={v.status} size="sm" />
            </div>
          ))}
          {filteredVehicles.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No vehicles found
            </div>
          )}
        </div>
      </div>

      {/* Toggle Panel Button */}
      {!showPanel && (
        <button
          className="btn btn--ghost"
          onClick={() => setShowPanel(true)}
          style={{ position: 'absolute', top: 12, left: 12, zIndex: 600, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
        >
          <Filter size={16} /> Fleet
        </button>
      )}

      {/* Layer Controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 600, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button className={`btn btn--sm ${showVehicles ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setShowVehicles(!showVehicles)}>
          {showVehicles ? <Eye size={14} /> : <EyeOff size={14} />} Vehicles
        </button>
        <button className={`btn btn--sm ${showOrders ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setShowOrders(!showOrders)}>
          {showOrders ? <Eye size={14} /> : <EyeOff size={14} />} Orders
        </button>
        <button className={`btn btn--sm ${showRoutes ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setShowRoutes(!showRoutes)}>
          {showRoutes ? <Eye size={14} /> : <EyeOff size={14} />} Routes
        </button>
      </div>

      {/* Map */}
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        <FitBounds vehicles={vehicles} />
        <TileLayer
          url={theme === 'light'
            ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            : 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://stadiamaps.com/">Stadia Maps</a>'
        />
        {showVehicles && filteredVehicles.map((v) => (
          <VehicleMarker key={v.id} vehicle={v} onClick={handleVehicleClick} />
        ))}
        {showOrders && orders.map((o) => (
          <span key={o.id}>
            <OrderMarker order={o} type="pickup" />
            <OrderMarker order={o} type="dropoff" />
          </span>
        ))}
        {showRoutes && routes.map((r) => (
          <RoutePolyline key={r.id} route={r} />
        ))}
      </MapContainer>

      {/* Selected Vehicle Detail */}
      {selectedVehicle && (
        <div style={{
          position: 'absolute', bottom: 20, right: 20, zIndex: 600,
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
          border: '1px solid var(--glass-border)', padding: 20, minWidth: 280,
          backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <button
            className="btn btn--ghost btn--icon"
            onClick={() => setSelectedVehicle(null)}
            style={{ position: 'absolute', top: 8, right: 8 }}
          >
            <X size={16} />
          </button>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
            {selectedVehicle.plateNumber}
          </div>
          <div style={{ display: 'grid', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>Driver: {selectedVehicle.driverName || 'N/A'}</div>
            <div>Type: {selectedVehicle.type}</div>
            <div>Fuel: {selectedVehicle.fuelLevel}%</div>
            <div>Location: {selectedVehicleLat?.toFixed(4)}, {selectedVehicleLng?.toFixed(4)}</div>
            <div style={{ marginTop: 4 }}><StatusBadge status={selectedVehicle.status} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
