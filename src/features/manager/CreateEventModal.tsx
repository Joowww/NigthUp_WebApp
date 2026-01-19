import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Clock, MapPin, DollarSign, Tag, Users, Image as ImageIcon } from 'lucide-react';
import { cities, getCityCoordinates } from '../../assets/dataCA';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface CreateEventModalProps {
  onClose: () => void;
  onSave: (event: any) => void;
  initialData?: any;
}

export function CreateEventModal({ onClose, onSave, initialData }: CreateEventModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.title || '',
    venue: initialData?.venue || '',
    latitude: initialData?.location?.coordinates?.[0] || '',
    longitude: initialData?.location?.coordinates?.[1] || '',
    date: initialData?.schedule ? new Date(initialData.schedule).toISOString().split('T')[0] : (initialData?.date || ''),
    time: initialData?.schedule ? new Date(initialData.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (initialData?.time || ''),
    category: initialData?.category || '',
    price: initialData?.price || '',
    capacity: initialData?.capacity || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    city: initialData?.city || '',
  });

  const categories = ['Trap', 'Reagge', 'Edgy', 'Tecno', 'Reaggeton', 'House', 'Loofy', 'Funk', 'Pop', 'Indie', 'Rock', 'Metal', 'Trendy', 'Pop con ñ', 'España 2000'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct Schedule Date
    const scheduleDate = new Date(`${formData.date}T${formData.time}`);

    const eventData = {
      // Start with initialData but exclude fields we don't want to carry over blindly if we are rebuilding them or if they risk overwriting our 'formData'
      ...initialData,

      ...formData,
      // Map fields to backend schema
      name: formData.name, // Ensure name is passed as 'name' (backend expects name)
      // Some backends might want 'title' as alias, keeping both or ensuring 'name' is priority
      title: formData.name,
      schedule: scheduleDate,
      location: {
        type: 'Point',
        coordinates: [parseFloat(formData.latitude) || 0, parseFloat(formData.longitude) || 0]
      },
      image: formData.image,
      price: parseFloat(formData.price?.toString().replace('€', '')) || 0,

      capacity: parseInt(formData.capacity) || 0,
      city: formData.city,
    };

    // Remove legacy fields if they clash or are synthesized above
    if (!initialData) {
      eventData.attendees = 0;
      eventData.createdAt = new Date();
    }

    onSave(eventData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'city') {
      const coords = getCityCoordinates(value);
      if (coords) {
        // coords is [lng, lat] from dataCA
        setFormData(prev => ({
          ...prev,
          [field]: value,
          longitude: coords[0].toString(),
          latitude: coords[1].toString()
        }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValid = Boolean(formData.name && formData.venue && formData.date && formData.time && formData.category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-2xl shadow-[#ff0080]/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
            {initialData ? t('common.edit', 'Editar') : t('manager.create_event_btn', 'Crear Evento')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-muted p-2 hover:bg-muted/80 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('manager.event_name_label', 'Nombre del Evento')} *</Label>
            <Input
              id="name"
              placeholder={t('manager.event_name_placeholder', 'Ej: Noche Electrónica 2024')}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="bg-background border-border"
            />
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#00d9ff]" />
              {t('dictionary.ciudad', 'Ciudad')} *
            </Label>
            <Select value={formData.city} onValueChange={(value) => handleChange('city', value)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('manager.select_city_placeholder', 'Selecciona una ciudad')} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lugar y Coordenadas */}
          <div className="space-y-4 border-b border-border pb-4">
            <div className="space-y-2">
              <Label htmlFor="venue" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#00d9ff]" />
                {t('common.location', 'Lugar')} (Nombre/Dirección) *
              </Label>
              <Input
                id="venue"
                placeholder={t('manager.venue_placeholder', 'Ej: Club Paradise')}
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                required
                className="bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                  id="latitude"
                  placeholder="Ej: 41.3851"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleChange('latitude', e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                  id="longitude"
                  placeholder="Ej: 2.1734"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleChange('longitude', e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#7928ca]" />
                {t('manager.date_label', 'Fecha')} *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#50fa7b]" />
                {t('manager.time_label', 'Hora')} *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                required
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#ff0080]" />
              {t('manager.category_label', 'Categoría')} *
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('manager.select_category_placeholder', 'Selecciona una categoría')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{t(`dictionary.${cat}`, cat)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Precio y Capacidad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#f1fa8c]" />
                {t('event_details.entry_price', 'Precio de Entrada')} (€)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="Ej: 15"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#ffb86c]" />
                {t('event_details.max_capacity', 'Capacidad Máxima')}
              </Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Ej: 500"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('manager.description_label', 'Descripción')}</Label>
            <Textarea
              id="description"
              placeholder={t('manager.description_placeholder', 'Describe tu evento...')}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="bg-background border-border resize-none"
            />
          </div>

          {/* URL de Imagen */}
          <div className="space-y-2">
            <Label htmlFor="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#00d9ff]" />
              URL de Imagen
            </Label>
            <Input
              id="image"
              type="url"
              placeholder="https://..."
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Añade una URL de imagen para tu evento
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className={`flex-1 bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/30 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {initialData ? t('manager.save_changes_btn', 'Guardar Cambios') : t('manager.create_event_btn', 'Crear Evento')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
