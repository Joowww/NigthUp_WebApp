// features/business/BusinessList.tsx
import type { IBusiness } from '../../modules/bussiness';
import { BusinessCard } from './BusinessCard';

interface BusinessListProps {
  businesses: IBusiness[];
  onShowBusinessOnMap?: (business: IBusiness) => void;
  userLocation?: [number, number]; // ← AÑADIR
}

export const BusinessList: React.FC<BusinessListProps> = ({
  businesses,
  onShowBusinessOnMap,
  userLocation // ← AÑADIR
}) => {
  if (businesses.length === 0) {
    return (
      <p className="text-muted-foreground">
        No hay discotecas disponibles
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map(business => (
        <BusinessCard
          key={business._id}
          business={business}
          onShowMap={() => onShowBusinessOnMap?.(business)}
          userLocation={userLocation}
        />
      ))}
    </div>
  );
};