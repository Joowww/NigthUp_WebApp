import { useState } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign, Tag, Users, Image as ImageIcon } from 'lucide-react';
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
    imageUrl: initialData?.image || '',
  });

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
      image: formData.imageUrl,
      price: parseFloat(formData.price?.toString().replace('€', '')) || 0,
      capacity: parseInt(formData.capacity) || 0,
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
            {initialData ? 'Editar Evento' : 'Crear Nuevo Evento'}
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
            <Label htmlFor="name">Nombre del Evento *</Label>
            <Input
              id="name"
              placeholder="Ej: Noche Electrónica 2024"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="bg-background border-border"
            />
          </div>

          {/* Lugar y Coordenadas */}
          <div className="space-y-4 border-b border-border pb-4">
            <div className="space-y-2">
              <Label htmlFor="venue" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#00d9ff]" />
                Lugar (Nombre/Dirección) *
              </Label>
              <Input
                id="venue"
                placeholder="Ej: Club Paradise"
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
                Fecha *
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
                Hora *
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
              Categoría *
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electrónica">Electrónica</SelectItem>
                <SelectItem value="Techno">Techno</SelectItem>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Urbano">Urbano</SelectItem>
                <SelectItem value="Latino">Latino</SelectItem>
                <SelectItem value="Rock">Rock</SelectItem>
                <SelectItem value="Pop">Pop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Precio y Capacidad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#f1fa8c]" />
                Precio de Entrada (€)
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
                Capacidad Máxima
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
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe tu evento..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="bg-background border-border resize-none"
            />
          </div>

          {/* URL de Imagen */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#00d9ff]" />
              URL de Imagen
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
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
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className={`flex-1 bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/30 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {initialData ? 'Guardar Cambios' : 'Crear Evento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
