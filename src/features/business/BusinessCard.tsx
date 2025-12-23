// features/business/BusinessCard.tsx
import type { IBusiness } from '../../modules/bussiness';
import { MapPin } from 'lucide-react'; // o usa el icono que prefieras

interface BusinessCardProps {
  business: IBusiness;
  onClick?: () => void;
  onShowMap?: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onClick,
  onShowMap
}) => {
  return (
    <div
      className={`
        relative cursor-pointer rounded-xl border p-4 transition
        ${business.active ? 'border-border hover:shadow-lg' : 'opacity-50'}
        bg-card group
      `}
      onClick={onClick}
    >
      {/* Botón de mapa flotante */}
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

      {/* Avatar opcional */}
      {business.avatar && (
        <img
          src={business.avatar}
          alt={business.name}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
      )}

      <h3 className="text-lg font-semibold">
        {business.name}
      </h3>

      {business.address && (
        <p className="text-sm text-muted-foreground">
          {business.address}
        </p>
      )}

      {business.phone && (
        <p className="text-sm mt-1">
          📞 {business.phone}
        </p>
      )}

      {!business.active && (
        <span className="text-xs text-red-500 font-medium">
          Inactiva
        </span>
      )}
    </div>
  );
};