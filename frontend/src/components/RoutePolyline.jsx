import { Polyline, Popup } from 'react-leaflet';

const statusColors = {
  ACTIVE: '#3B82F6',
  COMPLETED: '#10B981',
  PENDING: '#F59E0B',
  OPTIMIZED: '#8B5CF6',
};

export default function RoutePolyline({ route, isOriginal = false }) {
  let waypoints = route.waypoints || [];

  if (typeof waypoints === 'string') {
    try {
      waypoints = JSON.parse(waypoints);
    } catch (e) {
      console.error('Failed to parse waypoints JSON:', e);
      waypoints = [];
    }
  }

  if (!Array.isArray(waypoints) || waypoints.length < 2) return null;

  const positions = waypoints
    .map((wp) => {
      const lat = wp.latitude !== undefined ? wp.latitude : wp.lat;
      const lng = wp.longitude !== undefined ? wp.longitude : wp.lng;
      return [lat, lng];
    })
    .filter(([lat, lng]) => lat !== undefined && lat !== null && lng !== undefined && lng !== null);

  if (positions.length < 2) return null;

  const color = isOriginal ? '#64748B' : (statusColors[route.status] || '#3B82F6');

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color,
        weight: isOriginal ? 3 : 4,
        opacity: isOriginal ? 0.5 : 0.8,
        dashArray: isOriginal ? '10 6' : route.status === 'PENDING' ? '8 4' : null,
      }}
    >
      <Popup>
        <div style={{ minWidth: 140 }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
            Route #{route.id}
          </div>
          <div style={{ fontSize: '0.8rem', marginBottom: 2 }}>
            Waypoints: {waypoints.length}
          </div>
          {route.totalDistance && (
            <div style={{ fontSize: '0.8rem' }}>
              Distance: {route.totalDistance} km
            </div>
          )}
        </div>
      </Popup>
    </Polyline>
  );
}
