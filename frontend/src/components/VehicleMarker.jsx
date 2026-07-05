import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import StatusBadge from './StatusBadge';

function createVehicleIcon(status) {
  const colors = {
    ACTIVE: { fill: '#10B981', bg: 'rgba(16,185,129,0.2)', border: '#10B981' },
    IDLE: { fill: '#F59E0B', bg: 'rgba(245,158,11,0.2)', border: '#F59E0B' },
    MAINTENANCE: { fill: '#EF4444', bg: 'rgba(239,68,68,0.2)', border: '#EF4444' },
  };
  const c = colors[status] || colors.IDLE;
  const pulseClass = status === 'ACTIVE' ? 'vehicle-marker-pulse' : '';

  return L.divIcon({
    className: 'vehicle-marker',
    html: `
      <div class="vehicle-marker-icon ${pulseClass}" style="background:${c.bg};border-color:${c.border}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18" r="2"/>
          <circle cx="7" cy="18" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export default function VehicleMarker({ vehicle, onClick }) {
  const lat = vehicle.latitude !== undefined ? vehicle.latitude : vehicle.currentLat;
  const lng = vehicle.longitude !== undefined ? vehicle.longitude : vehicle.currentLng;

  if (lat === undefined || lat === null || lng === undefined || lng === null) return null;

  return (
    <Marker
      position={[lat, lng]}
      icon={createVehicleIcon(vehicle.status)}
      eventHandlers={{ click: () => onClick?.(vehicle) }}
    >
      <Popup>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>{vehicle.plateNumber}</div>
          <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>Driver: {vehicle.driverName || 'N/A'}</div>
          <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>Type: {vehicle.type}</div>
          <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>Fuel: {vehicle.fuelLevel}%</div>
          <StatusBadge status={vehicle.status} size="sm" />
        </div>
      </Popup>
    </Marker>
  );
}
