import { useState, useEffect } from 'react';
import { fetchOrders, fetchVehicles, createOrder, assignOrder, updateOrderStatus } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Plus, Search, Check, AlertCircle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modal & Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    pickupAddress: '',
    pickupLat: 28.6139,
    pickupLng: 77.2090,
    dropoffAddress: '',
    dropoffLat: 28.6315,
    dropoffLng: 77.2167,
    priority: 'MEDIUM',
    weight: 5.0,
  });

  const loadData = async () => {
    try {
      const [oData, vData] = await Promise.all([
        fetchOrders(),
        fetchVehicles(),
      ]);
      setOrders(oData || []);
      setFilteredOrders(oData || []);
      setVehicles(vData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = orders;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.pickupAddress?.toLowerCase().includes(q) ||
          o.dropoffAddress?.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (priorityFilter) {
      result = result.filter((o) => o.priority === priorityFilter);
    }

    setFilteredOrders(result);
  }, [search, statusFilter, priorityFilter, orders]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const generatedId = `FF-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Add a slight random offset to coordinates based on CP center to look realistic
      const latOffset = (Math.random() - 0.5) * 0.08;
      const lngOffset = (Math.random() - 0.5) * 0.08;

      const orderData = {
        ...newOrder,
        orderId: generatedId,
        pickupLat: 28.6139 + latOffset,
        pickupLng: 77.2090 + lngOffset,
        dropoffLat: 28.6315 - latOffset,
        dropoffLng: 77.2167 - lngOffset,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      await createOrder(orderData);
      setShowCreateModal(false);
      // Reset form
      setNewOrder({
        customerName: '',
        pickupAddress: '',
        pickupLat: 28.6139,
        pickupLng: 77.2090,
        dropoffAddress: '',
        dropoffLat: 28.6315,
        dropoffLng: 77.2167,
        priority: 'MEDIUM',
        weight: 5.0,
      });
      loadData();
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  const handleAssignVehicle = async () => {
    if (!selectedVehicleId || !assigningOrder) return;
    try {
      await assignOrder(assigningOrder.id, selectedVehicleId);
      setAssigningOrder(null);
      setSelectedVehicleId('');
      loadData();
    } catch (err) {
      console.error('Failed to assign vehicle:', err);
    }
  };

  const handleCompleteOrder = async (order) => {
    try {
      await updateOrderStatus(order.id, 'DELIVERED');
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const columns = [
    { key: 'orderId', label: 'Order ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'customerName', label: 'Customer' },
    { key: 'pickupAddress', label: 'Pickup Point' },
    { key: 'dropoffAddress', label: 'Dropoff Point' },
    { key: 'priority', label: 'Priority', render: (val) => <StatusBadge status={val} /> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'assignedVehicleId',
      label: 'Dispatcher',
      render: (val, row) => {
        if (!val) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAssigningOrder(row);
              }}
              className="btn btn-ghost"
              style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid var(--accent-blue)' }}
            >
              Assign
            </button>
          );
        }
        const v = vehicles.find((vehicle) => vehicle.id === val);
        return v ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {v.plateNumber} ({v.driverName})
          </span>
        ) : (
          `Vehicle #${val}`
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (val, row) => {
        if (row.status === 'IN_TRANSIT') {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCompleteOrder(row);
              }}
              className="btn btn-ghost"
              style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Check size={12} /> Delivered
            </button>
          );
        }
        return null;
      },
    },
  ];

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span>Loading Delivery Orders...</span>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Delivery Orders</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={18} className="search-icon" style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by order, customer or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 38 }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
          style={{ width: 160 }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED">Delivered</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="form-input"
          style={{ width: 160 }}
        >
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredOrders} />

      {/* CREATE ORDER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h2 style={{ marginBottom: 20, color: 'var(--text-primary)' }}>New Delivery Order</h2>
            <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                    className="form-input"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={newOrder.weight}
                    onChange={(e) => setNewOrder({ ...newOrder, weight: parseFloat(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Pickup Address</label>
                <input
                  type="text"
                  required
                  value={newOrder.pickupAddress}
                  onChange={(e) => setNewOrder({ ...newOrder, pickupAddress: e.target.value })}
                  className="form-input"
                  placeholder="Street address for pickup"
                />
              </div>

              <div>
                <label className="form-label">Dropoff Address</label>
                <input
                  type="text"
                  required
                  value={newOrder.dropoffAddress}
                  onChange={(e) => setNewOrder({ ...newOrder, dropoffAddress: e.target.value })}
                  className="form-input"
                  placeholder="Street address for delivery"
                />
              </div>

              <div style={{ display: 'flex', justifyItems: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN VEHICLE MODAL */}
      {assigningOrder && (
        <div className="modal-overlay" onClick={() => setAssigningOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 style={{ marginBottom: 16 }}>Dispatch Order {assigningOrder.orderId}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Select a vehicle to dispatch for delivery from {assigningOrder.pickupAddress} to {assigningOrder.dropoffAddress}.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">Select Available Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles
                    .filter((v) => v.status === 'IDLE' || v.status === 'ACTIVE')
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plateNumber} - {v.driverName} ({v.type} • {v.status})
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setAssigningOrder(null)} className="btn btn-ghost" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button
                  disabled={!selectedVehicleId}
                  onClick={handleAssignVehicle}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Confirm Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
