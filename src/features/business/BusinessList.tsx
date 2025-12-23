// features/business/BusinessList.tsx
import type { IBusiness } from '../../modules/bussiness';
import { BusinessCard } from './businesscard';

interface BusinessListProps {
  businesses: IBusiness[];
  onSelectBusiness: (business: IBusiness) => void;
  onShowBusinessOnMap?: (business: IBusiness) => void;
}

export const BusinessList: React.FC<BusinessListProps> = ({
  businesses,
  onSelectBusiness,
  onShowBusinessOnMap
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
          onClick={() => onSelectBusiness(business)}
          onShowMap={() => onShowBusinessOnMap?.(business)}
        />
      ))}
    </div>
  );
};