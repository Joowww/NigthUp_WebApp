// features/business/BusinessMap.tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { IBusiness } from '../../modules/bussiness';

// Icono por defecto para discotecas sin avatar
const DEFAULT_BUSINESS_ICON = '/default-disco.png'; // Puedes usar una imagen de disco ball o similar

const createBusinessIcon = (business: IBusiness, isExpanded: boolean = false) => {
  const size = isExpanded ? 64 : 36; // Cambié de 48 a 64
  const avatarUrl = business.avatar || DEFAULT_BUSINESS_ICON;
  
  const iconHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${isExpanded ? '4px' : '3px'} solid #8b5cf6;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 ${isExpanded ? '6px 8px' : '4px 6px'} rgba(0, 0, 0, 0.3);
    ">
      <img 
        src="${avatarUrl}" 
        alt="${business.name}"
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
        "
        onerror="this.src='${DEFAULT_BUSINESS_ICON}'"
      />
    </div>
    <div style="
      position: absolute;
      bottom: -${isExpanded ? '10px' : '8px'};
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: ${isExpanded ? '8px' : '6px'} solid transparent;
      border-right: ${isExpanded ? '8px' : '6px'} solid transparent;
      border-top: ${isExpanded ? '10px' : '8px'} solid #8b5cf6;
    "></div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'business-marker-icon',
    iconSize: [size, size + (isExpanded ? 10 : 8)],
    iconAnchor: [size / 2, size + (isExpanded ? 10 : 8)],
    popupAnchor: [0, -(size + (isExpanded ? 10 : 8))]
  });
};

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
    const zoom = isExpanded ? 17 : 15;
    
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
          if (!business.location?.coordinates) return null;
          
          const [lng, lat] = business.location.coordinates;
          const isSelected = selectedBusiness?._id === business._id;

          return (
            <Marker
              key={business._id}
              position={[lat, lng]}
              icon={createBusinessIcon(business, isExpanded && isSelected)}
              eventHandlers={{
                click: () => onSelectBusiness?.(business)
              }}
            >
              <Popup>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  {business.avatar && (
                    <img 
                      src={business.avatar} 
                      alt={business.name}
                      className="w-full h-24 object-cover rounded"
                    />
                  )}
                  <strong className="text-base">{business.name}</strong>
                  {business.address && (
                    <p className="text-sm text-gray-600">{business.address}</p>
                  )}
                  {business.phone && (
                    <p className="text-sm">📞 {business.phone}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style>{`
        .business-marker-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};