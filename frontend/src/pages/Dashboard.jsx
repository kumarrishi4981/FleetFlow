import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import {
  Truck, Package, TrendingUp, Clock, Zap, Activity, ExternalLink,
  Compass, ArrowUpRight, ArrowDownRight, Fuel, MapPin, BarChart3, Route
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { fetchDashboard, fetchDispatchLogs, fetchVehicles, autoDispatch } from '../services/api';
import VehicleMarker from '../components/VehicleMarker';
import StatusBadge from '../components/StatusBadge';

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
  }, [center, zoom]);
  return null;
}

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);
  const [dashboard, setDashboard] = useState(null);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState(12);
  const [focusedId, setFocusedId] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState('');

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        fetchDashboard(), fetchDispatchLogs(), fetchVehicles()
      ]);
      if (results[0].status === 'fulfilled') setDashboard(results[0].value);
      if (results[1].status === 'fulfilled') setDispatchLogs(results[1].value || []);
      if (results[2].status === 'fulfilled') setVehicles(results[2].value || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleDispatch = async () => {
    setDispatching(true); setDispatchMsg('Assigning orders...');
    try { await autoDispatch(); setDispatchMsg('✓ Dispatch complete'); await loadData(); }
    catch { setDispatchMsg('✗ Dispatch failed'); }
    finally { setDispatching(false); setTimeout(() => setDispatchMsg(''), 4000); }
  };

  const focusVehicle = (v) => {
    const lat = v.currentLat ?? v.latitude; const lng = v.currentLng ?? v.longitude;
    if (lat && lng) { setMapCenter([lat, lng]); setMapZoom(15); setFocusedId(v.id); }
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  };

  if (loading) return (
    <div className="loading-overlay"><div className="spinner" /><span>Loading dashboard...</span></div>
  );

  const d = dashboard || {};
  const online = vehicles.filter(v => v.status === 'ACTIVE').length;
  const idle = vehicles.filter(v => v.status === 'IDLE').length;
  const maint = vehicles.filter(v => v.status === 'MAINTENANCE').length;
  const totalDist = d.totalDistanceCoveredKm || 0;
  const deliveredPct = d.totalOrders > 0 ? Math.round((d.deliveredOrders / d.totalOrders) * 100) : 0;
  const pendingPct = d.totalOrders > 0 ? Math.round((d.pendingOrders / d.totalOrders) * 100) : 0;
  const transitPct = d.totalOrders > 0 ? Math.round((d.inTransitOrders / d.totalOrders) * 100) : 0;

  // Smart contextual greeting — always warm, never "Good Night"
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 4 && h < 6)   return { text: 'Rise & Shine, Early Bird',   emoji: '🌅', sub: `You're ahead of the game — your fleet awaits.` };
    if (h >= 6 && h < 12)  return { text: 'Good Morning',               emoji: '☀️', sub: 'A fresh day to move the world forward.' };
    if (h >= 12 && h < 17) return { text: 'Good Afternoon',             emoji: '🚀', sub: 'Operations are in full swing — keep the momentum.' };
    if (h >= 17 && h < 21) return { text: 'Good Evening',               emoji: '🌇', sub: `Wrapping up strong — here's your fleet pulse.` };
    if (h >= 21 && h < 24) return { text: 'Burning the Midnight Oil',   emoji: '🔥', sub: 'Late hustle pays off — your network never sleeps.' };
    /* 0–3 AM */           return { text: 'Night Owl Mode',              emoji: '🦉', sub: 'The world sleeps, but your fleet keeps moving.' };
  };
  const greeting = getGreeting();

  const tileUrl = theme === 'light'
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

  return (
    <div className="page-enter ff-dashboard">

      {/* ─── HERO GREETING ─── */}
      <div className="ff-hero">
        <div className="ff-hero-bg" />
        <div className="ff-hero-content">
          <div className="ff-hero-left">
            <h1>
              {greeting.text} {greeting.emoji}
            </h1>
            <p>{greeting.sub}</p>
          </div>
          <div className="ff-hero-right">
            <div className="ff-hero-stat">
              <span className="hero-stat-num">{d.totalOrders || 0}</span>
              <span className="hero-stat-lbl">Total Orders</span>
            </div>
            <div className="ff-hero-divider" />
            <div className="ff-hero-stat">
              <span className="hero-stat-num">{vehicles.length}</span>
              <span className="hero-stat-lbl">Fleet Size</span>
            </div>
            <div className="ff-hero-divider" />
            <div className="ff-hero-stat">
              <span className="hero-stat-num">{totalDist.toFixed(0)}<small> km</small></span>
              <span className="hero-stat-lbl">Distance Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STAT CHIPS ─── */}
      <div className="ff-stat-chips">
        <div className="ff-chip chip-orange">
          <div className="chip-icon"><Truck size={18} /></div>
          <div className="chip-info">
            <div className="chip-val">{online}<span className="chip-sub">/{vehicles.length}</span></div>
            <div className="chip-lbl">Online</div>
          </div>
          <div className="chip-trend up"><ArrowUpRight size={14} /></div>
        </div>
        <div className="ff-chip chip-blue">
          <div className="chip-icon"><Package size={18} /></div>
          <div className="chip-info">
            <div className="chip-val">{d.inTransitOrders || 0}</div>
            <div className="chip-lbl">In Transit</div>
          </div>
          <div className="chip-trend up"><ArrowUpRight size={14} /></div>
        </div>
        <div className="ff-chip chip-emerald">
          <div className="chip-icon"><TrendingUp size={18} /></div>
          <div className="chip-info">
            <div className="chip-val">{d.completionRate || 0}<small>%</small></div>
            <div className="chip-lbl">Completion</div>
          </div>
          <div className="chip-trend up"><ArrowUpRight size={14} /></div>
        </div>
        <div className="ff-chip chip-rose">
          <div className="chip-icon"><Clock size={18} /></div>
          <div className="chip-info">
            <div className="chip-val">{d.avgRouteTimeMinutes || 0}<small> min</small></div>
            <div className="chip-lbl">Avg Duration</div>
          </div>
          <div className="chip-trend down"><ArrowDownRight size={14} /></div>
        </div>
      </div>

      {/* ─── MAIN GRID ─── */}
      <div className="ff-main-grid">

        {/* LEFT: LIVE MAP */}
        <div className="ff-map-card">
          <div className="ff-map-header">
            <div className="ff-map-badge"><span className="live-dot" />Live Tracking</div>
            <Link to="/map" className="ff-map-expand"><ExternalLink size={14} /> Full Map</Link>
          </div>
          <div className="ff-map-container">
            <MapContainer center={mapCenter} zoom={mapZoom} zoomControl={true} style={{ width:'100%', height:'100%' }}>
              <ChangeView center={mapCenter} zoom={mapZoom} />
              <TileLayer url={tileUrl} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://stadiamaps.com/">Stadia Maps</a>' />
              {vehicles.map(v => <VehicleMarker key={v.id} vehicle={v} onClick={() => focusVehicle(v)} />)}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="ff-right-col">

          {/* ORDER PIPELINE */}
          <div className="ff-card ff-pipeline-card">
            <div className="ff-card-title"><BarChart3 size={16} /> Order Pipeline</div>
            <div className="pipeline-bars">
              <div className="pipe-row">
                <span className="pipe-label">Delivered</span>
                <div className="pipe-track"><div className="pipe-fill emerald" style={{ width: `${deliveredPct}%` }} /></div>
                <span className="pipe-val">{d.deliveredOrders || 0}</span>
              </div>
              <div className="pipe-row">
                <span className="pipe-label">In Transit</span>
                <div className="pipe-track"><div className="pipe-fill blue" style={{ width: `${transitPct}%` }} /></div>
                <span className="pipe-val">{d.inTransitOrders || 0}</span>
              </div>
              <div className="pipe-row">
                <span className="pipe-label">Pending</span>
                <div className="pipe-track"><div className="pipe-fill amber" style={{ width: `${pendingPct}%` }} /></div>
                <span className="pipe-val">{d.pendingOrders || 0}</span>
              </div>
            </div>
          </div>

          {/* FLEET STATUS */}
          <div className="ff-card ff-fleet-card">
            <div className="ff-card-title"><Activity size={16} /> Fleet Status</div>
            <div className="fleet-status-grid">
              <div className="fleet-status-item">
                <div className="fs-dot active" /><span className="fs-count">{online}</span><span className="fs-lbl">Active</span>
              </div>
              <div className="fleet-status-item">
                <div className="fs-dot idle" /><span className="fs-count">{idle}</span><span className="fs-lbl">Idle</span>
              </div>
              <div className="fleet-status-item">
                <div className="fs-dot maint" /><span className="fs-count">{maint}</span><span className="fs-lbl">Service</span>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="ff-card ff-actions-card">
            <div className="ff-card-title"><Zap size={16} /> Quick Actions</div>
            <button className="ff-action-btn primary" onClick={handleDispatch} disabled={dispatching}>
              {dispatching ? <div className="spinner sm-spinner" /> : <Zap size={14} />}
              <span>Auto Dispatch</span>
            </button>
            <Link to="/routes" className="ff-action-btn ghost">
              <Compass size={14} /><span>Route Optimizer</span><ExternalLink size={12} />
            </Link>
            {dispatchMsg && <div className="ff-dispatch-msg"><span className="live-dot" />{dispatchMsg}</div>}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM: FLEET LIST + TIMELINE ─── */}
      <div className="ff-bottom-grid">
        <div className="ff-card ff-fleet-list-card">
          <div className="ff-card-title"><Truck size={16} /> Fleet Telemetry <span className="title-badge">{vehicles.length} vehicles</span></div>
          <div className="ff-fleet-table-wrap">
            <table className="ff-fleet-table">
              <thead>
                <tr>
                  <th>Vehicle</th><th>Driver</th><th>Status</th><th>Fuel</th><th>Speed</th><th></th>
                </tr>
              </thead>
              <tbody>
                {vehicles.slice(0, 8).map(v => (
                  <tr key={v.id} className={focusedId === v.id ? 'focused-row' : ''} onClick={() => focusVehicle(v)}>
                    <td className="plate-cell">{v.plateNumber}</td>
                    <td>{v.driverName || '—'}</td>
                    <td><StatusBadge status={v.status} size="sm" /></td>
                    <td>
                      <div className="fuel-bar-wrap">
                        <div className="fuel-bar" style={{ width: `${v.fuelLevel}%`, background: v.fuelLevel > 40 ? 'var(--accent-emerald)' : v.fuelLevel > 20 ? 'var(--accent-amber)' : 'var(--accent-rose)' }} />
                      </div>
                      <span className="fuel-text">{v.fuelLevel}%</span>
                    </td>
                    <td>{v.speed || 0} km/h</td>
                    <td><button className="locate-btn" onClick={(e) => { e.stopPropagation(); focusVehicle(v); }}><MapPin size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {vehicles.length > 8 && <Link to="/vehicles" className="view-all-link">View all {vehicles.length} vehicles →</Link>}
        </div>

        <div className="ff-card ff-timeline-card">
          <div className="ff-card-title"><Activity size={16} /> Recent Activity</div>
          <div className="ff-timeline">
            {dispatchLogs.length === 0
              ? <div className="empty-timeline">No recent dispatch activity</div>
              : dispatchLogs.slice(0, 6).map((log, i) => (
                <div key={log.id || i} className="tl-item">
                  <div className="tl-dot" />
                  <div className="tl-line" />
                  <div className="tl-body">
                    <div className="tl-text">{log.notes || `Order #${log.orderId} → Vehicle #${log.vehicleId}`}</div>
                    <div className="tl-time">{formatTime(log.createdAt || log.timestamp)}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
