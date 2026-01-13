// features/business/BusinessMap.tsx
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { IBusiness } from '../../modules/bussiness';
import { BusinessDetailModal } from './BusinessDetailModal';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { MapPin, Phone, Navigation, Crosshair, Route, Layers, Map as MapIcon, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

const DEFAULT_BUSINESS_ICON = '/default-disco.png';

// 🧮 Calcular distancia usando fórmula Haversine
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 📏 Formatear distancia
const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

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

const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  
  return L.divIcon({
    html: `
      <div style="
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        font-weight: bold;
        color: white;
        font-size: 16px;
      ">
        ${count}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [50, 50],
    iconAnchor: [25, 25]
  });
};

interface BusinessMapProps {
  businesses: IBusiness[];
  selectedBusiness?: IBusiness | null;
  onSelectBusiness?: (b: IBusiness) => void;
  isExpanded?: boolean;
  userLocation?: [number, number];
}

// 🗺️ Componente que fuerza el centrado en la ubicación del usuario
const AutoCenter: React.FC<{ userLocation: [number, number] }> = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    console.log('🎯 AUTO-CENTRANDO mapa en ubicación real:', userLocation);
    map.setView(userLocation, 13);
  }, [userLocation, map]);

  return null;
};

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
  isExpanded = false,
  userLocation: externalUserLocation
}) => {
  const [modalBusiness, setModalBusiness] = useState<IBusiness | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(externalUserLocation || null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const heightClass = isExpanded ? 'h-full' : 'h-full';

  // 📍 RECIBIR UBICACIÓN DEL PADRE - SIMPLIFICADO
  useEffect(() => {

    
    if (externalUserLocation) {
      console.log('📍 BusinessMap: Usando ubicación del padre:', externalUserLocation);
      setUserLocation(externalUserLocation);
    } else {
      console.log('⏳ BusinessMap: Esperando ubicación del padre...');
    }
  }, [externalUserLocation]);

  // 🚗 Función CORREGIDA para abrir navegación con ubicación real
  const openNavigation = (business: IBusiness) => {
    if (!userLocation) {
      alert('⚠️ No se pudo obtener tu ubicación actual. Verifica los permisos de ubicación.');
      return;
    }

    const [lng, lat] = business.location.coordinates;
    const [userLat, userLng] = userLocation;
    
    console.log('🗺️ Navegando desde tu ubicación:', [userLat, userLng]);
    console.log('🗺️ Hacia:', [lat, lng]);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let url: string;
    
    if (isIOS) {
      url = `maps://maps.apple.com/?saddr=${userLat},${userLng}&daddr=${lat},${lng}&dirflg=d`;
      console.log('🍎 Abriendo Apple Maps');
    } else if (isAndroid) {
      url = `google.navigation:q=${lat},${lng}`;
      console.log('🤖 Abriendo Google Maps (Android)');
    } else {
      url = `https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`;
      console.log('💻 Abriendo Google Maps (Web)');
    }
    
    window.open(url, '_blank');
  };

  // 🔄 Función para recentrar con actualización de ubicación
  const recenterMap = () => {
    if (!userLocation) return;
    
    const map = (window as any).__leafletMap;
    if (map) {
      console.log('🗺️ Centrando mapa en ubicación guardada');
      map.flyTo(userLocation, 14, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  };

  const tileUrls = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  // ⏳ LOADING mientras se obtiene la ubicación
  if (!userLocation) {
    return (
      <div className={`relative w-full ${heightClass} rounded-lg overflow-hidden border border-border bg-card flex flex-col items-center justify-center gap-4`}>
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center space-y-2 px-6">
          <p className="text-foreground font-semibold">
            📍 Obteniendo tu ubicación...
          </p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Por favor, permite el acceso a tu ubicación
            </p>
            <p className="text-xs text-muted-foreground">
              Asegúrate de que GPS/Wi-Fi estén activos
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative w-full ${heightClass} rounded-lg overflow-hidden border border-border`}>
        {/* 🎛️ PANEL DE HERRAMIENTAS AGRUPADO A LA IZQUIERDA */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 items-start">
          {/* Botón centrar en ubicación */}
          <Button
            onClick={recenterMap}
            variant="default"
            size="icon"
            className="bg-card hover:bg-card/90 border border-border shadow-lg"
            title="Centrar en mi ubicación actual"
          >
            <Crosshair className="h-5 w-5 text-primary" />
          </Button>

          {/* Dropdown de capas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="bg-card hover:bg-card/90 border border-border shadow-lg"
                title="Cambiar capa del mapa"
              >
                <Layers className="h-5 w-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              side="right" 
              sideOffset={8}
              className="w-48 bg-card border-border z-[1001]"
            >
              <DropdownMenuLabel className="text-foreground">Tipo de mapa</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuCheckboxItem
                checked={mapStyle === 'streets'}
                onCheckedChange={() => setMapStyle('streets')}
                className="text-foreground"
              >
                <MapIcon className="h-4 w-4 mr-2 text-primary" />
                Calles
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={mapStyle === 'satellite'}
                onCheckedChange={() => setMapStyle('satellite')}
                className="text-foreground"
              >
                <Layers className="h-4 w-4 mr-2 text-accent" />
                Satélite
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Espaciador */}
          <div className="h-2"></div>

          {/* Badge informativo */}
          <Badge 
            variant="outline" 
            className="bg-card/95 backdrop-blur-sm border-border text-foreground shadow-lg px-3 py-2 whitespace-nowrap z-[999]"
          >
            {businesses.length} resultado{businesses.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <MapContainer
          center={userLocation}
          zoom={13}
          scrollWheelZoom={true}
          zoomControl={false}
          className="w-full h-full z-0"
          ref={(mapInstance) => {
            if (mapInstance) {
              (window as any).__leafletMap = mapInstance;
              console.log('🗺️ Mapa creado y referencia guardada');
            }
          }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url={tileUrls[mapStyle]}
          />

          <ZoomControl 
            position="bottomleft"
            zoomInTitle="Ampliar"
            zoomOutTitle="Alejar"
          />

          <AutoCenter userLocation={userLocation} />
          <MapFocus business={selectedBusiness} isExpanded={isExpanded} />

          {/* Marcador de ubicación del usuario */}
          <Marker
            position={userLocation}
            icon={L.divIcon({
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #3b82f6;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                "></div>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-sm font-semibold">
                📍 Tu ubicación actual
              </div>
            </Popup>
          </Marker>

          {/* 🎯 CLUSTERING DE MARCADORES */}
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
          >
            {businesses.map(business => {
              if (!business.location?.coordinates) return null;
              
              const [lng, lat] = business.location.coordinates;
              const isSelected = selectedBusiness?._id === business._id;

              const distance = calculateDistance(
                userLocation[0],
                userLocation[1],
                lat,
                lng
              );

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
                      {business.avatar && (
                        <div className="relative h-44 w-full overflow-hidden">
                          <img 
                            src={business.avatar} 
                            alt={business.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          
                          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                            <Badge 
                              className={business.active 
                                ? "bg-green-500 hover:bg-green-600 shadow-lg" 
                                : "bg-red-500 hover:bg-red-600 shadow-lg"
                              }
                            >
                              {business.active ? 'Activa' : 'Inactiva'}
                            </Badge>
                            
                            <Badge className="bg-primary/90 backdrop-blur-sm shadow-lg">
                              <Navigation className="h-3.5 w-3.5 mr-1" />
                              {formatDistance(distance)}
                            </Badge>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      )}
                      
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

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Button
                            onClick={() => openNavigation(business)}
                            variant="outline"
                            className="h-10 text-sm font-semibold border-primary/50 hover:bg-primary/10"
                            size="default"
                          >
                            <Route className="h-4 w-4 mr-2" />
                            Cómo llegar
                          </Button>
                          <Button
                            onClick={() => setModalBusiness(business)}
                            className="h-10 text-sm font-semibold"
                            size="default"
                          >
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>

        <style>{`
          .business-marker-icon {
            background: transparent !important;
            border: none !important;
          }

          .user-location-marker {
            background: transparent !important;
            border: none !important;
          }

          .custom-cluster-icon {
            background: transparent !important;
            border: none !important;
          }

          .custom-cluster-icon div {
            animation: clusterPulse 2s ease-in-out infinite;
          }

          @keyframes clusterPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          .leaflet-bottom.leaflet-left {
            bottom: 12px !important;
            left: 12px !important;
            z-index: 999 !important;
          }

          .leaflet-control-zoom {
            border: 2px solid hsl(var(--border)) !important;
            border-radius: 0.5rem !important;
            overflow: hidden !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
            margin: 0 !important;
          }

          .leaflet-control-zoom a {
            background: hsl(var(--card)) !important;
            color: hsl(var(--foreground)) !important;
            border-bottom: 1px solid hsl(var(--border)) !important;
            width: 40px !important;
            height: 40px !important;
            line-height: 40px !important;
            font-size: 22px !important;
            font-weight: bold !important;
            transition: all 0.2s !important;
            cursor: pointer !important;
            text-decoration: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            pointer-events: auto !important;
          }

          .leaflet-control-zoom a:hover {
            background: hsl(var(--card) / 0.9) !important;
            color: hsl(var(--primary)) !important;
            transform: scale(1.05) !important;
          }

          .leaflet-control-zoom a:active {
            background: hsl(var(--card) / 0.8) !important;
            transform: scale(0.95) !important;
          }

          .leaflet-control-zoom a:last-child {
            border-bottom: none !important;
          }

          .leaflet-control-zoom-in,
          .leaflet-control-zoom-out {
            pointer-events: auto !important;
          }

          .leaflet-control-zoom {
            pointer-events: auto !important;
          }

          .leaflet-disabled {
            opacity: 0.4 !important;
            cursor: not-allowed !important;
          }

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
        hideMapTab={true}
        userLocation={userLocation}
      />
    </>
  );
};