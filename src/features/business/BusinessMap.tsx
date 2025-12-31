// features/business/BusinessMap.tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { IBusiness } from '../../modules/bussiness';
import { BusinessDetailModal } from './BusinessDetailModal';
import { Button } from '../../ui/button';
import { MapPin, Phone } from 'lucide-react';

const DEFAULT_BUSINESS_ICON = '/default-disco.png';

const createBusinessIcon = (business: IBusiness, isExpanded: boolean = false) => {
  const size = isExpanded ? 64 : 36;
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
  const [modalBusiness, setModalBusiness] = useState<IBusiness | null>(null);
  const heightClass = isExpanded ? 'h-full' : 'h-full';

  return (
    <>
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
                <Popup 
                  maxWidth={360} 
                  minWidth={300}
                  className="business-popup"
                  closeButton={true}
                  autoPan={true}
                  autoPanPadding={[80, 80]}
                  keepInView={true}
                  maxHeight={500}
                >
                    <div className="bg-card rounded-lg overflow-hidden">
                      {/* Imagen del negocio */}
                      {business.avatar && (
                        <div className="relative h-44 w-full overflow-hidden">
                          <img 
                            src={business.avatar} 
                            alt={business.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          {/* Badge de estado - posicionado a la izquierda para evitar solapamiento con X */}
                          {!business.active && (
                            <div className="absolute top-3 left-3">
                              <span className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-full shadow-lg">
                                Inactiva
                              </span>
                            </div>
                          )}
                          {business.active && (
                            <div className="absolute top-3 left-3">
                              <span className="px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-full shadow-lg">
                                Activa
                              </span>
                            </div>
                          )}
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      )}
                      
                      {/* Contenido */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-xl font-bold text-foreground leading-tight">
                          {business.name}
                        </h3>
                        
                        {business.address && (
                          <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                            <span className="leading-relaxed flex-1">{business.address}</span>
                          </div>
                        )}
                        
                        {business.phone && (
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                            <span className="font-medium">{business.phone}</span>
                          </div>
                        )}

                        <Button
                          onClick={() => setModalBusiness(business)}
                          className="w-full mt-4 h-10 text-base font-semibold"
                          size="default"
                        >
                          Ver detalles completos
                        </Button>
                      </div>
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

          /* Popup personalizado */
          .business-popup .leaflet-popup-content-wrapper {
            padding: 0 !important;
            border-radius: 1rem !important;
            background: hsl(var(--card)) !important;
            border: 1px solid hsl(var(--border)) !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
            overflow: hidden !important;
            max-width: 360px !important;
          }
          
          .business-popup .leaflet-popup-content {
            margin: 0 !important;
            width: 100% !important;
            min-width: 300px !important;
          }

          .business-popup .leaflet-popup-tip-container {
            display: none !important;
          }

          .business-popup .leaflet-popup-close-button {
            position: absolute !important;
            top: 0 !important;
            right: 0 !important;
            color: white !important;
            font-size: 24px !important;
            font-weight: bold !important;
            width: 36px !important;
            height: 36px !important;
            padding: 0 !important;
            margin: 8px !important;
            background: rgba(0, 0, 0, 0.6) !important;
            border-radius: 50% !important;
            transition: all 0.2s !important;
            z-index: 1001 !important;
            line-height: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            backdrop-filter: blur(4px) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
          }

          .business-popup .leaflet-popup-close-button:hover {
            background: rgba(0, 0, 0, 0.8) !important;
            transform: scale(1.1) !important;
            color: white !important;
          }

          .business-popup a.leaflet-popup-close-button {
            text-decoration: none !important;
          }

          /* Animación de entrada */
          .business-popup {
            animation: popupFadeIn 0.3s ease-out;
          }

          @keyframes popupFadeIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </div>

      <BusinessDetailModal
        business={modalBusiness}
        onClose={() => setModalBusiness(null)}
        hideMapTab={true} // Oculta el tab de mapa cuando se abre desde el mapa
      />
    </>
  );
};