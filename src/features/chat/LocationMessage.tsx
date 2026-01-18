import { useState, useEffect } from 'react';
import { Navigation, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ILocationData } from '../../modules/chat';

// Corregir problema de iconos de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMessageProps {
    locationData: ILocationData;
    isOwn: boolean;
}

export function LocationMessage({ locationData, isOwn }: LocationMessageProps) {
    const { latitude, longitude, address, name } = locationData;
    const [fetchedAddress, setFetchedAddress] = useState<string | null>(null);

    // URL para abrir en Google Maps
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    useEffect(() => {
        if (!address && !name) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
                .then(res => res.json())
                .then(data => {
                    const addr = data.address;
                    const street = addr.road || addr.pedestrian || addr.suburb || addr.city || '';
                    const houseNumber = addr.house_number ? `${addr.house_number}, ` : '';
                    setFetchedAddress(`${houseNumber}${street}`);
                })
                .catch(err => console.error('Error fetching address:', err));
        }
    }, [latitude, longitude, address, name]);

    const displayAddress = address || fetchedAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    return (
        <div className={`
      w-full max-w-[280px] overflow-hidden rounded-2xl shadow-lg border transition-all hover:scale-[1.02]
      ${isOwn
                ? 'bg-gradient-to-br from-primary/90 to-primary border-primary/30'
                : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
            }
    `}>
            {/* Mapa de OpenStreetMap */}
            <div className="relative h-44 w-full z-0 overflow-hidden border-b border-white/10">
                <MapContainer
                    center={[latitude, longitude]}
                    zoom={15}
                    zoomControl={false}
                    attributionControl={false}
                    style={{ height: '100%', width: '100%' }}
                    dragging={false}
                    touchZoom={false}
                    doubleClickZoom={false}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[latitude, longitude]} />
                </MapContainer>

                {/* Overlay de Coordenadas */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg z-10">
                    <p className="text-[10px] text-white/90 font-mono">
                        {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="flex items-start gap-2 mb-2">
                    <Navigation className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isOwn ? 'text-primary-foreground/70' : 'text-blue-400'}`} />
                    <div className="flex-1 min-w-0 text-left">
                        <p className={`font-semibold text-sm mb-0.5 truncate ${isOwn ? 'text-primary-foreground' : 'text-white'}`}>
                            {name || 'Ubicación compartida'}
                        </p>
                        <p className={`text-xs truncate ${isOwn ? 'text-primary-foreground/70' : 'text-white/60'}`}>
                            {displayAddress}
                        </p>
                    </div>
                </div>

                {/* Botón para abrir en Maps */}
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
            flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg font-medium text-xs transition-all hover:scale-[1.02] active:scale-95
            ${isOwn
                            ? 'bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }
          `}
                >
                    <ExternalLink className="w-3 h-3" />
                    Abrir en Google Maps
                </a>
            </div>
        </div>
    );
}
