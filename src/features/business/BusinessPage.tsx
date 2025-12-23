// features/business/BusinessPage.tsx
import { useEffect, useState } from 'react';
import { BusinessList } from './businessList';
import { BusinessMap } from './businessMap';
import { getBusinesses } from './bussinessService';
import type { IBusiness } from '../../modules/bussiness';
import { Button } from '../../ui/button';
import { X } from 'lucide-react';

export const BusinessPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getBusinesses(0, 50);
      setBusinesses(data.businesses);
    };
    load();
  }, []);

  const handleShowBusinessOnMap = (business: IBusiness) => {
    setSelectedBusiness(business);
    setActiveTab('map');
    setIsMapExpanded(true);
  };

  const closeExpandedMap = () => {
    setIsMapExpanded(false);
  };

  return (
    <div className="h-full w-full p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Discotecas</h1>

      {/* TABS */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'list' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('list');
            setIsMapExpanded(false);
          }}
        >
          Listado
        </Button>
        <Button
          variant={activeTab === 'map' ? 'default' : 'outline'}
          onClick={() => setActiveTab('map')}
        >
          Mapa
        </Button>
      </div>

      {/* LISTADO */}
      {activeTab === 'list' && (
        <BusinessList
          businesses={businesses}
          onSelectBusiness={(b) => {
            setSelectedBusiness(b);
          }}
          onShowBusinessOnMap={handleShowBusinessOnMap}
        />
      )}

      {/* MAPA NORMAL */}
      {activeTab === 'map' && !isMapExpanded && (
        <div className="h-[420px]">
          <BusinessMap
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            onSelectBusiness={setSelectedBusiness}
          />
        </div>
      )}

      {/* MAPA EXPANDIDO (MODAL) */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-50 bg-black/80 animate-in fade-in duration-300">
          <div className="relative w-full h-full p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 z-[60] bg-background/80 hover:bg-background"
              onClick={closeExpandedMap}
            >
              <X size={24} />
            </Button>

            <div className="w-full h-full rounded-lg overflow-hidden">
              <BusinessMap
                businesses={businesses}
                selectedBusiness={selectedBusiness}
                onSelectBusiness={setSelectedBusiness}
                isExpanded
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};