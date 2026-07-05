import { useState, useEffect } from 'react';
import { fetchOrders, fetchVehicles, autoDispatch, fetchDispatchLogs } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Zap, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export default function Dispatch() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [idleVehicles, setIdleVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResults, setDispatchResults] = useState(null);

  const loadData = async () => {
    try {
      const [oData, vData, lData] = await Promise.all([
        fetchOrders(),
        fetchVehicles(),
        fetchDispatchLogs(),
      ]);
      
      setPendingOrders((oData || []).filter((o) => o.status === 'PENDING'));
      setIdleVehicles((vData || []).filter((v) => v.status === 'IDLE'));
      setLogs(lData || []);
    } catch (err) {
      console.error('Failed to load dispatch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAutoDispatch = async () => {
    setDispatching(true);
    setDispatchResults(null);
    try {
      const results = await autoDispatch();
      setDispatchResults(results || []);
      await loadData();
    } catch (err) {
      console.error('Auto dispatch error:', err);
    } finally {
      setDispatching(false);
    }
  };

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  }

  const logColumns = [
    {
      key: 'timestamp',
      label: 'Time',
      render: (val) => <span style={{ color: 'var(--text-muted)' }}>{formatTime(val)}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
    {
      key: 'notes',
      label: 'Details',
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span>Loading Dispatch Control Center...</span>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Auto-Dispatch Console</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
            Automatically match pending orders with nearest idle vehicles using capacity and distance routing.
          </p>
        </div>
        <button
          disabled={pendingOrders.length === 0 || idleVehicles.length === 0 || dispatching}
          onClick={handleAutoDispatch}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: '1rem', boxShadow: '0 0 16px var(--accent-blue-glow)' }}
        >
          {dispatching ? (
            <>
              <RefreshCw className="spinner" size={18} /> Routing...
            </>
          ) : (
            <>
              <Zap size={18} fill="currentColor" /> Run Auto Dispatch
            </>
          )}
        </button>
      </div>

      {/* AUTO DISPATCH RESULTS OVERLAY */}
      {dispatchResults && (
        <div className="glass-panel" style={{ padding: 24, marginBottom: 28, borderRadius: 'var(--radius)', border: '1px solid var(--accent-emerald)', background: 'rgba(16,185,129,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>
            <CheckCircle2 size={22} /> Auto-Dispatch Run Complete
          </div>
          
          {dispatchResults.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              No matches found. All available vehicles are either too small for the orders or out of range.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Successfully matched **{dispatchResults.length}** deliveries to available drivers:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {dispatchResults.map((res, i) => (
                  <div key={i} className="glass-panel" style={{ padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 8, borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>
                      <Send size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Order {res.orderId}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Driver {res.vehiclePlate} ({res.distanceKm.toFixed(1)} km away)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DUAL PANELS */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* PENDING ORDERS */}
        <div className="chart-container" style={{ padding: 20 }}>
          <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span>Pending Orders</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 12 }}>
              {pendingOrders.length} waiting
            </span>
          </h3>
          
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                All orders successfully dispatched!
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{order.orderId}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.customerName} • {order.pickupAddress}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.weight} kg</span>
                    <StatusBadge status={order.priority} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* IDLE VEHICLES */}
        <div className="chart-container" style={{ padding: 20 }}>
          <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span>Available Vehicles</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 12 }}>
              {idleVehicles.length} ready
            </span>
          </h3>

          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {idleVehicles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No available vehicles. All vehicles are currently active or in maintenance.
              </div>
            ) : (
              idleVehicles.map((v) => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{v.plateNumber}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.driverName} • {v.type}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Capacity</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{v.capacity} kg</div>
                    </div>
                    <StatusBadge status={v.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RECENT DISPATCH LOGS */}
      <div className="chart-container">
        <h3 style={{ marginBottom: 16 }}>Recent Dispatch Activity</h3>
        <DataTable columns={logColumns} data={logs} />
      </div>
    </div>
  );
}
