import { useContext } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { ThemeContext } from '../context/ThemeContext';

const statusColors = {
  ACTIVE: '#10B981',
  IDLE: '#F59E0B',
  MAINTENANCE: '#EF4444',
};

export default function MiniMap({ vehicles = [] }) {
  const { theme } = useContext(ThemeContext);
  const tileUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="map-container map-container--mini">
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {vehicles.map((v) => {
          const lat = v.latitude !== undefined ? v.latitude : v.currentLat;
          const lng = v.longitude !== undefined ? v.longitude : v.currentLng;

          if (lat === undefined || lat === null || lng === undefined || lng === null) return null;

          return (
            <CircleMarker
              key={v.id}
              center={[lat, lng]}
              radius={4}
              pathOptions={{
                color: statusColors[v.status] || '#94A3B8',
                fillColor: statusColors[v.status] || '#94A3B8',
                fillOpacity: 0.9,
                weight: 1,
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
