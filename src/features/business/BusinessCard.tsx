// features/business/BusinessCard.tsx
import { useState } from 'react';
import type { IBusiness } from '../../modules/bussiness';
import { MapPin } from 'lucide-react';
import { BusinessDetailModal } from './BusinessDetailModal';
import { ImageWithFallback } from '../ImageWithFallback'; 

interface BusinessCardProps {
  business: IBusiness;
  onShowMap?: () => void;
  userLocation?: [number, number]; // ← AÑADIR
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onShowMap,
  userLocation // ← AÑADIR
}) => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        className={`
          relative cursor-pointer rounded-xl border p-4 transition
          ${business.active ? 'border-border hover:shadow-lg' : 'opacity-50'}
          bg-card group
        `}
        onClick={() => setShowDetail(true)}
      >
        {business.location && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowMap?.();
            }}
            className="
              absolute top-3 right-3 z-10
              p-2 rounded-full bg-primary text-primary-foreground
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              hover:scale-110 transform
            "
            title="Ver en mapa"
          >
            <MapPin size={18} />
          </button>
        )}

        {business.avatar ? (
          <ImageWithFallback
            src={business.avatar}
            alt={business.name}
            className="w-full h-40 object-cover rounded-md mb-3"
          />
        ) : (
          <div className="w-full h-40 bg-muted rounded-md mb-3 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Sin imagen</span>
          </div>
        )}

        <h3 className="text-lg font-semibold">{business.name}</h3>

        {business.address && (
          <p className="text-sm text-muted-foreground">{business.address}</p>
        )}

        {business.phone && (
          <p className="text-sm mt-1">📞 {business.phone}</p>
        )}

        {!business.active && (
          <span className="text-xs text-red-500 font-medium">Inactiva</span>
        )}
      </div>

      <BusinessDetailModal
        business={showDetail ? business : null}
        onClose={() => setShowDetail(false)}
        userLocation={userLocation} 
      />
    </>
  );
};