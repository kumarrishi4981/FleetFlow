import { CircleMarker, Popup } from 'react-leaflet';
import StatusBadge from './StatusBadge';

export default function OrderMarker({ order, type = 'pickup' }) {
  const isPickup = type === 'pickup';
  const lat = isPickup 
    ? (order.pickupLatitude !== undefined ? order.pickupLatitude : order.pickupLat) 
    : (order.dropoffLatitude !== undefined ? order.dropoffLatitude : order.dropoffLat);
  const lng = isPickup 
    ? (order.pickupLongitude !== undefined ? order.pickupLongitude : order.pickupLng) 
    : (order.dropoffLongitude !== undefined ? order.dropoffLongitude : order.dropoffLng);
  const address = isPickup ? order.pickupAddress : order.dropoffAddress;

  if (lat === undefined || lat === null || lng === undefined || lng === null) return null;

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={7}
      pathOptions={{
        color: isPickup ? '#10B981' : '#EF4444',
        fillColor: isPickup ? '#10B981' : '#EF4444',
        fillOpacity: 0.7,
        weight: 2,
      }}
    >
      <Popup>
        <div style={{ minWidth: 160 }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
            {isPickup ? '📦 Pickup' : '📍 Dropoff'}
          </div>
          <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>Order: #{order.id}</div>
          <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>{order.customerName}</div>
          <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>{address || 'N/A'}</div>
          <StatusBadge status={order.status} size="sm" />
        </div>
      </Popup>
    </CircleMarker>
  );
}
