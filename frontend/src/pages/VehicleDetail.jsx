import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import { fetchVehicle, fetchOrders, fetchDispatchLogs } from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import StatusBadge from '../components/StatusBadge';
import VehicleMarker from '../components/VehicleMarker';
import DataTable from '../components/DataTable';
import { ArrowLeft, Fuel, Weight, Compass, Eye } from 'lucide-react';

export default function VehicleDetail() {
  const { theme } = useContext(ThemeContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [vData, oData, lData] = await Promise.all([
          fetchVehicle(id),
          fetchOrders(),
          fetchDispatchLogs(),
        ]);
        setVehicle(vData);
        // Filter orders by assignedVehicleId
        setOrders((oData || []).filter((o) => o.assignedVehicleId === Number(id)));
        // Filter logs by vehicleId
        setLogs((lData || []).filter((l) => l.vehicleId === Number(id)));
      } catch (err) {
        console.error('Failed to load vehicle details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span>Loading Vehicle Details...</span>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="page-enter" style={{ padding: 24, textAlign: 'center' }}>
        <h2>Vehicle not found</h2>
        <Link to="/vehicles" className="btn btn-primary" style={{ marginTop: 16 }}>
          Back to Inventory
        </Link>
      </div>
    );
  }

  const orderColumns = [
    { key: 'orderId', label: 'Order ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'customerName', label: 'Customer' },
    { key: 'dropoffAddress', label: 'Destination' },
    { key: 'priority', label: 'Priority', render: (val) => <StatusBadge status={val} /> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  }

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => navigate('/vehicles')} className="btn btn-ghost" style={{ padding: 8 }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0 }}>{vehicle.plateNumber}</h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
            Driver: {vehicle.driverName || 'Unassigned'} • Type: <span className="type-tag">{vehicle.type}</span>
          </p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="chart-container" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Vehicle Diagnostics</h3>
          <div className="diagnostic-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="diagnostic-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
              <div style={{ padding: 10, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)' }}>
                <Fuel size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fuel Level</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{vehicle.fuelLevel}%</div>
              </div>
            </div>

            <div className="diagnostic-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
              <div style={{ padding: 10, borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>
                <Weight size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Load Capacity</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{vehicle.capacity} kg</div>
              </div>
            </div>

            <div className="diagnostic-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
              <div style={{ padding: 10, borderRadius: '50%', backgroundColor: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)' }}>
                <Compass size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{vehicle.currentLat.toFixed(4)}, {vehicle.currentLng.toFixed(4)}</div>
              </div>
            </div>

            <div className="diagnostic-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
              <div style={{ padding: 10, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--accent-rose)' }}>
                <Eye size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Speed</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{vehicle.speed} km/h</div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container" style={{ padding: 0, overflow: 'hidden', height: 260, borderRadius: 'var(--radius)', position: 'relative' }}>
          <MapContainer
            center={[vehicle.currentLat, vehicle.currentLng]}
            zoom={13}
            zoomControl={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <VehicleMarker vehicle={vehicle} />
          </MapContainer>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="chart-container">
          <h3 style={{ marginBottom: 16 }}>Assigned Deliveries</h3>
          <DataTable columns={orderColumns} data={orders} />
        </div>

        <div className="chart-container">
          <h3 style={{ marginBottom: 16 }}>Dispatch Timeline</h3>
          <div className="activity-feed" style={{ maxHeight: 300, overflowY: 'auto' }}>
            {logs.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">No activity logged for this vehicle</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={log.id || i} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-content">
                    <div className="activity-text">{log.notes || `[${log.action}] Action logged`}</div>
                    <div className="activity-time">{formatTime(log.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
