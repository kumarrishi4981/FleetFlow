import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchVehicles, createVehicle } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Search, Plus, X, Globe, MapPin, Sparkles } from 'lucide-react';

const INDIAN_LOCATIONS = [
  { name: 'Delhi (NCT)', code: 'DL', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai (Maharashtra)', code: 'MH', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru (Karnataka)', code: 'KA', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai (Tamil Nadu)', code: 'TN', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata (West Bengal)', code: 'WB', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad (Telangana)', code: 'TS', lat: 17.3850, lng: 78.4867 },
  { name: 'Pune (Maharashtra)', code: 'MH', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad (Gujarat)', code: 'GJ', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur (Rajasthan)', code: 'RJ', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow (Uttar Pradesh)', code: 'UP', lat: 26.8467, lng: 80.9462 },
  { name: 'Kochi (Kerala)', code: 'KL', lat: 9.9312, lng: 76.2673 },
  { name: 'Guwahati (Assam)', code: 'AS', lat: 26.1158, lng: 91.7086 },
];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [plateNumber, setPlateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleType, setVehicleType] = useState('TRUCK');
  const [vehicleStatus, setVehicleStatus] = useState('IDLE');
  const [capacity, setCapacity] = useState(5000);
  const [fuelLevel, setFuelLevel] = useState(100);
  const [locationIndex, setLocationIndex] = useState(0);
  const [customLat, setCustomLat] = useState('28.6139');
  const [customLng, setCustomLng] = useState('77.2090');

  const loadVehicles = async () => {
    try {
      const data = await fetchVehicles();
      setVehicles(data || []);
      setFilteredVehicles(data || []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    let result = vehicles;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.plateNumber?.toLowerCase().includes(q) ||
          v.driverName?.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter((v) => v.status === statusFilter);
    }

    if (typeFilter) {
      result = result.filter((v) => v.type === typeFilter);
    }

    setFilteredVehicles(result);
  }, [search, statusFilter, typeFilter, vehicles]);

  // Handle city selection change to auto-update coordinates and suggest a plate prefix
  const handleLocationChange = (index) => {
    setLocationIndex(index);
    const loc = INDIAN_LOCATIONS[index];
    if (loc) {
      setCustomLat(loc.lat.toString());
      setCustomLng(loc.lng.toString());
      // Auto-suggest a plate number suffix if not modified yet or empty
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const chars = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                    String.fromCharCode(65 + Math.floor(Math.random() * 26));
      setPlateNumber(`${loc.code}01${chars}${randomPart}`);
    }
  };

  // Generate random dummy values for quick filling
  const handleQuickFill = () => {
    const firstNames = ['Rohan', 'Vijay', 'Rahul', 'Sanjay', 'Aditya', 'Preeti', 'Rajesh', 'Vikram', 'Ananya', 'Karan'];
    const lastNames = ['Sharma', 'Verma', 'Kumar', 'Joshi', 'Mehra', 'Singh', 'Patel', 'Yadav', 'Gupta', 'Iyer'];
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    setDriverName(randomName);

    const randType = ['TRUCK', 'VAN', 'BIKE'][Math.floor(Math.random() * 3)];
    setVehicleType(randType);
    setCapacity(randType === 'TRUCK' ? 6000 : randType === 'VAN' ? 1500 : 25);
    setFuelLevel(Math.floor(40 + Math.random() * 60));

    // Choose random city
    const randLocIndex = Math.floor(Math.random() * INDIAN_LOCATIONS.length);
    handleLocationChange(randLocIndex);
  };

  const handleOpenModal = () => {
    setPlateNumber('');
    setDriverName('');
    setVehicleType('TRUCK');
    setVehicleStatus('IDLE');
    setCapacity(5000);
    setFuelLevel(100);
    handleLocationChange(0); // DL default
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!plateNumber || !driverName) {
      setSubmitError('Plate Number and Driver Name are required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const newVehicleData = {
      plateNumber: plateNumber.toUpperCase().trim(),
      type: vehicleType,
      status: vehicleStatus,
      currentLat: parseFloat(customLat),
      currentLng: parseFloat(customLng),
      fuelLevel: parseInt(fuelLevel),
      capacity: parseFloat(capacity),
      driverName: driverName.trim(),
      speed: 0.0
    };

    try {
      await createVehicle(newVehicleData);
      setIsModalOpen(false);
      await loadVehicles();
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Failed to create vehicle. Check if plate number is unique.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'plateNumber',
      label: 'Plate Number',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</span>,
    },
    { key: 'driverName', label: 'Driver' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <span className="type-tag">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'fuelLevel',
      label: 'Fuel Level',
      render: (val) => {
        let color = 'var(--accent-emerald)';
        if (val < 25) color = 'var(--accent-rose)';
        else if (val < 50) color = 'var(--accent-amber)';
        return (
          <div className="fuel-bar-wrapper">
            <div className="fuel-bar-fill" style={{ width: `${val}%`, backgroundColor: color }} />
            <span className="fuel-text">{val}%</span>
          </div>
        );
      },
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (val) => `${val} kg`,
    },
    {
      key: 'location',
      label: 'Hub Location',
      render: (_, row) => {
        // Find nearest city name to lat/lng for display
        const lat = row.currentLat ?? row.latitude;
        const lng = row.currentLng ?? row.longitude;
        if (!lat || !lng) return '—';
        let closest = INDIAN_LOCATIONS[0];
        let minDist = Infinity;
        INDIAN_LOCATIONS.forEach(loc => {
          const d = Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2);
          if (d < minDist) {
            minDist = d;
            closest = loc;
          }
        });
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
            <MapPin size={12} style={{ color: 'var(--accent-primary)' }} />
            {closest.name.split(' ')[0]}
          </span>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span>Loading Fleet Inventory...</span>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Fleet Inventory</h1>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={18} className="search-icon" style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by plate or driver..."
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
          <option value="ACTIVE">Active</option>
          <option value="IDLE">Idle</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="form-input"
          style={{ width: 160 }}
        >
          <option value="">All Types</option>
          <option value="TRUCK">Truck</option>
          <option value="VAN">Van</option>
          <option value="BIKE">Bike</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredVehicles}
        onRowClick={(row) => navigate(`/vehicles/${row.id}`)}
      />

      {/* ─── ADD VEHICLE MODAL ─── */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Fleet Vehicle</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVehicleSubmit}>
              <div className="modal-body">
                {submitError && (
                  <div style={{ color: 'var(--accent-rose)', background: 'var(--accent-rose-glow)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {submitError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={handleQuickFill} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}>
                    <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} /> Quick Fill
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Base Hub Location</label>
                    <select
                      value={locationIndex}
                      onChange={(e) => handleLocationChange(parseInt(e.target.value))}
                      className="form-input"
                    >
                      {INDIAN_LOCATIONS.map((loc, idx) => (
                        <option key={loc.name} value={idx}>{loc.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Plate Number</label>
                    <input
                      type="text"
                      placeholder="e.g. MH12AB1234"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Driver Name</label>
                    <input
                      type="text"
                      placeholder="Enter driver's full name"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => {
                        setVehicleType(e.target.value);
                        // Auto-adjust default capacity based on type
                        setCapacity(e.target.value === 'TRUCK' ? 5000 : e.target.value === 'VAN' ? 1500 : 20);
                      }}
                      className="form-input"
                    >
                      <option value="TRUCK">Truck</option>
                      <option value="VAN">Van</option>
                      <option value="BIKE">Bike</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Capacity (kg)</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(parseFloat(e.target.value))}
                      className="form-input"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Fuel Level (%)</label>
                    <input
                      type="number"
                      value={fuelLevel}
                      onChange={(e) => setFuelLevel(parseInt(e.target.value))}
                      className="form-input"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={vehicleStatus}
                    onChange={(e) => setVehicleStatus(e.target.value)}
                    className="form-input"
                  >
                    <option value="IDLE">Idle</option>
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
