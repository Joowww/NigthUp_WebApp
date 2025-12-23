// features/business/BusinessMap.tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { IBusiness } from '../../modules/bussiness';

const businessIcon = new L.Icon({
  iconUrl: '/marker-business.png',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36]
});

interface BusinessMapProps {
  businesses: IBusiness[];
  selectedBusiness?: IBusiness | null;
  onSelectBusiness?: (b: IBusiness) => void;
  isExpanded?: boolean;
}

const MapFocus: React.FC<{ business?: IBusiness | null; isExpanded?: boolean }> = ({ 
  business, 
  isExpanded 
}) => {
  const map = useMap();

  useEffect(() => {
    if (!business) return;

    const [lng, lat] = business.location.coordinates;
    const zoom = isExpanded ? 16 : 15;
    
    map.flyTo([lat, lng], zoom, { 
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [business, map, isExpanded]);

  return null;
};

export const BusinessMap: React.FC<BusinessMapProps> = ({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  isExpanded = false
}) => {
  const heightClass = isExpanded ? 'h-full' : 'h-[400px]';

  return (
    <div className={`relative w-full ${heightClass} rounded-lg overflow-hidden border border-border`}>
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={12}
        scrollWheelZoom
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFocus business={selectedBusiness} isExpanded={isExpanded} />

        {businesses.map(business => {
          const [lng, lat] = business.location.coordinates;

          return (
            <Marker
              key={business._id}
              position={[lat, lng]}
              icon={businessIcon}
              eventHandlers={{
                click: () => onSelectBusiness?.(business)
              }}
            >
              <Popup>
                <strong>{business.name}</strong>
                <br />
                {business.address || 'Dirección no disponible'}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};