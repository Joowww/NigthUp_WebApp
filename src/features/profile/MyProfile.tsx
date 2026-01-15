import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Edit, Save, X, Upload, MapPin, Calendar, Mail, Phone, User, Heart, Music, Clock, Users, Loader2, Plus } from 'lucide-react';
import { userService } from './ProfileService';
import { getEvents, joinEvent, leaveEvent } from '../events/eventService';
import { EventDetailsModal } from '../events/EventDetailsModal';
import { ImageWithFallback } from '../ImageWithFallback';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import type { User as UserType } from '../../modules/user';
import type { Event } from '../../modules/event';
import { ImageUploadModal } from './ImageUploadModal';
import { useToast } from '../../hooks/useToast'; 
import { Toast } from '../../ui/toast'; 

export function MyProfile() {
  const { t } = useTranslation();
  const { user: authUser, updateUser } = useAuth();
  const { toasts, removeToast, success, error } = useToast(); 

  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({});
  
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  // ✅ FUNCIÓN MEJORADA PARA AVATAR
const handleAvatarUpload = async (file: File) => {
    try {
      setIsRefreshing(true);
      
      console.log('📤 Uploading avatar...');
      const updatedUser = await userService.updateAvatar(file);
      console.log('✅ Avatar updated, user data:', updatedUser);
      
      // Actualizar solo el campo avatar del profile, manteniendo el resto
      setProfile(prev => ({
        ...prev!,
        avatar: updatedUser.avatar
      }));
      
      // Actualizar auth context
      if (authUser) {
        updateUser({ 
          ...authUser, 
          avatar: updatedUser.avatar 
        });
      }
      
      success('Avatar actualizado correctamente');
    } catch (error: any) {
      console.error('❌ Error updating avatar:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el avatar';
      error(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // ✅ FUNCIÓN MEJORADA PARA COVER PHOTO
  const handleCoverPhotoUpload = async (file: File) => {
    try {
      setIsRefreshing(true);
      
      console.log('📤 Uploading cover photo...');
      const updatedUser = await userService.updateCoverPhoto(file);
      console.log('✅ Cover photo updated, user data:', updatedUser);
      
      // Actualizar solo el campo coverPhoto del profile, manteniendo el resto
      setProfile(prev => ({
        ...prev!,
        coverPhoto: updatedUser.coverPhoto
      }));
      
      // Actualizar auth context
      if (authUser) {
        updateUser({ 
          ...authUser, 
          coverPhoto: updatedUser.coverPhoto 
        });
      }
      
      success('Foto de portada actualizada correctamente'); // ✅ CAMBIAR
    } catch (err: any) {
      console.error('❌ Error updating cover photo:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar la foto de portada';
      error(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // ✅ FUNCIÓN PARA GUARDAR SOLO CAMPOS DE TEXTO
  const handleSave = async () => {
    try {
      setIsRefreshing(true);
      
      const changedFields: any = {};
      
      if (formData.username && formData.username !== profile?.username) {
        changedFields.username = formData.username;
      }
      if (formData.email && formData.email !== profile?.email) {
        changedFields.email = formData.email;
      }
      if (formData.phoneNumber !== undefined && formData.phoneNumber !== profile?.phoneNumber) {
        changedFields.phoneNumber = formData.phoneNumber;
      }
      if (formData.comunidad !== undefined && formData.comunidad !== profile?.comunidad) {
        changedFields.comunidad = formData.comunidad;
      }
      if (formData.intereses && JSON.stringify(formData.intereses) !== JSON.stringify(profile?.intereses)) {
        changedFields.intereses = formData.intereses;
      }
      
      if (Object.keys(changedFields).length === 0) {
        error('No hay cambios para guardar');
        setIsEditing(false);
        return;
      }
      
      const updatedUser = await userService.updateMyProfile(changedFields);
      
      setProfile(updatedUser);
      
      if (authUser) {
        updateUser({ ...authUser, ...updatedUser });
      }
      
      setIsEditing(false);
      setFormData({});
      
      success('Perfil actualizado correctamente'); // ✅ CAMBIAR
    } catch (err: any) {
      console.error('❌ Error al actualizar:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar el perfil';
      error(errorMessage); 
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // ✅ INICIAR EDICIÓN DE CAMPOS DE TEXTO
  const startEditing = () => {
    setFormData({
      username: profile?.username || '',
      email: profile?.email || '',
      phoneNumber: profile?.phoneNumber || '',
      comunidad: profile?.comunidad || '',
      intereses: profile?.intereses || []
    });
    setIsEditing(true);
  };
  
  // ✅ CANCELAR EDICIÓN DE CAMPOS DE TEXTO
  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };
  
  const handleJoinToggle = async (eventId: string) => {
    if (!authUser) {
      error(t('home.login_required_join', "Necesitas iniciar sesión"));
      return;
    }

    const isJoined = isUserJoined(eventId);
    const prevUserEvents = authUser.events ? [...authUser.events] : [];

    try {
      setIsRefreshing(true);
      
      if (isJoined) {
        const newUserEvents = prevUserEvents.filter((e: any) => 
          (typeof e === 'string' ? e : e._id) !== eventId
        );
        updateUser({ ...authUser, events: newUserEvents });
        await leaveEvent(eventId, authUser._id);
        
        setUserEvents(current => current.filter(ev => ev._id !== eventId));
        
        if (profile) {
          setProfile({ ...profile, events: newUserEvents });
        }
      } else {
        const newUserEvents = [...prevUserEvents, eventId];
        updateUser({ ...authUser, events: newUserEvents });
        await joinEvent(eventId, authUser._id);
        
        if (profile) {
          setProfile({ ...profile, events: newUserEvents });
        }
        
        const allEventsResponse = await getEvents(0, 100);
        const allEvents = allEventsResponse.events || [];
        const filteredUserEvents = allEvents.filter(event => 
          newUserEvents.includes(event._id)
        );
        setUserEvents(filteredUserEvents);
      }
    } catch (err) {
        console.error("Error en join/leave:", err);
        updateUser({ ...authUser, events: prevUserEvents });
        error(t('home.error_joining', "Hubo un error al procesar tu solicitud.")); 
      } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getMyProfile();
        console.log('Profile data:', data);
        setProfile(data);

        if (data.events && data.events.length > 0) {
          setLoadingEvents(true);
          try {
            const allEventsResponse = await getEvents(0, 100);
            const allEvents = allEventsResponse.events || [];
            
            const userEventIds = data.events.map((e: any) => 
              typeof e === 'string' ? e : e._id
            );
            const filteredUserEvents = allEvents.filter(event => 
              userEventIds.includes(event._id)
            );
            
            setUserEvents(filteredUserEvents);
          } catch (error) {
            console.error('Error loading user events:', error);
          } finally {
            setLoadingEvents(false);
          }
        } else {
          setLoadingEvents(false);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const isUserJoined = (eventId: string): boolean => {
    return profile?.events?.some((e: any) => (typeof e === 'string' ? e : e._id) === eventId) || false;
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const formatTime = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<UserType>) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-center text-muted-foreground mt-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-destructive">Error al cargar el perfil.</p>
      </div>
    );
  }

  const avatarUrl = profile.avatar?.startsWith('http') 
    ? profile.avatar 
    : profile.avatar 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${profile.avatar}`
      : '/default-avatar.png';

  const coverUrl = profile.coverPhoto?.startsWith('http')
    ? profile.coverPhoto
    : profile.coverPhoto
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${profile.coverPhoto}`
      : '/default-cover.jpg';

  return (
    <div className="min-h-screen pb-12">
    
     {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {isRefreshing && (
        <div className="fixed top-20 right-4 z-[1000]">
          <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 animate-in slide-in-from-top-2">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <span className="text-sm font-medium text-foreground">Actualizando perfil...</span>
          </div>
        </div>
      )}

      {/* Cover Photo */}
      <div className="relative h-80 w-full overflow-hidden">
        <img 
          src={coverUrl}
          alt="Cover" 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/default-cover.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80"></div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Button
            variant={isEditing ? "destructive" : "secondary"}
            onClick={isEditing ? handleCancel : startEditing}
            className="gap-2 backdrop-blur-md bg-black/50 hover:bg-black/70 border border-white/20"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Cancelar
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Editar Perfil
              </>
            )}
          </Button>

          {/* ✅ Botón de cover SIEMPRE visible */}
          <button
            onClick={() => setShowCoverModal(true)}
            className="p-2.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/70 transition-all border border-white/20"
            title="Cambiar portada"
          >
            <Upload className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">
        <Card className="backdrop-blur-xl bg-card/90 border border-border/50 shadow-2xl">
          <CardContent className="pt-6 pb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="relative group -mt-20">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <Avatar className="relative w-40 h-40 border-4 border-card shadow-xl">
                  <AvatarImage
                    src={avatarUrl}
                    alt={profile.username}
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.png';
                    }}
                  />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-secondary text-white">
                    {profile.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {/* ✅ Botón de avatar SIEMPRE visible al hacer hover */}
                <button 
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-2 right-2 p-2.5 bg-primary rounded-full hover:scale-110 transition-transform shadow-lg opacity-0 group-hover:opacity-100"
                  title="Cambiar avatar"
                >
                  <Upload className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Info del usuario */}
              <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {profile.username}
                </h1>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  <Badge variant="secondary" className="gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {profile.email}
                  </Badge>
                  {profile.phoneNumber && (
                    <Badge variant="secondary" className="gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {profile.phoneNumber}
                    </Badge>
                  )}
                  {profile.comunidad && (
                    <Badge variant="secondary" className="gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.comunidad}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-4 md:mt-0">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{profile.events?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Eventos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-secondary">{profile.intereses?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Intereses</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-xl border border-border/30">
            <TabsTrigger value="info" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white transition-all">
              <User className="w-4 h-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger value="interests" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:text-white transition-all">
              <Heart className="w-4 h-4 mr-2" />
              Intereses
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent/80 data-[state=active]:text-white transition-all">
              <Music className="w-4 h-4 mr-2" />
              Eventos
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - Información */}
          <TabsContent value="info" className="mt-6 space-y-4">
            <Card className="backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border border-primary/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nombre de usuario
                    </label>
                    <Input
                      name="username"
                      value={isEditing ? (formData.username || '') : (profile.username || '')}
                      disabled={!isEditing}
                      onChange={handleInputChange}
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary bg-background/50"
                      placeholder={!isEditing ? profile.username : 'Ingresa tu nombre de usuario'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={isEditing ? (formData.email || '') : (profile.email || '')}
                      disabled={!isEditing}
                      onChange={handleInputChange}
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary bg-background/50"
                      placeholder={!isEditing ? profile.email : 'Ingresa tu email'}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </label>
                    <Input
                      name="phoneNumber"
                      value={isEditing ? (formData.phoneNumber || '') : (profile.phoneNumber || '')}
                      disabled={!isEditing}
                      onChange={handleInputChange}
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary bg-background/50"
                      placeholder={!isEditing ? profile.phoneNumber : 'Ingresa tu teléfono'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fecha de nacimiento
                    </label>
                    <Input
                      value={new Date(profile.birthday).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Comunidad
                  </label>
                  <Input
                    name="comunidad"
                    value={isEditing ? (formData.comunidad || '') : (profile.comunidad || 'No especificada')}
                    disabled={!isEditing}
                    onChange={handleInputChange}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary bg-background/50"
                    placeholder={!isEditing ? (profile.comunidad || 'No especificada') : 'Ingresa tu comunidad'}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                    <Button onClick={handleCancel} variant="outline" className="gap-2">
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Content - Intereses */}
          <TabsContent value="interests" className="mt-6">
            <Card className="backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border border-secondary/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                      <Heart className="w-5 h-5 text-secondary" />
                    </div>
                    Mis Intereses
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startEditing}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {['Trap', 'Reagge', 'Edgy', 'Tecno', 'Reaggeton', 'House', 'Loofy', 'Funk', 'Pop', 'Indie', 'Rock', 'Metal', 'Trendy', 'Pop con ñ', 'España 2000'].map((categoria) => {
                    const currentInterests = isEditing 
                      ? (formData.intereses || profile.intereses || [])
                      : (profile.intereses || []);
                    const isSelected = currentInterests.includes(categoria);

                    return (
                      <button
                        key={categoria}
                        onClick={() => {
                          if (isEditing) {
                            const newInterests = isSelected
                              ? currentInterests.filter((i: string) => i !== categoria)
                              : [...currentInterests, categoria];
                            setFormData({ ...formData, intereses: newInterests });
                          }
                        }}
                        disabled={!isEditing}
                        className={`p-4 border rounded-xl transition-all duration-200 font-medium ${
                          isSelected
                            ? 'bg-secondary/20 border-secondary text-white shadow-[0_0_15px_rgba(121,40,202,0.3)] scale-105'
                            : 'bg-gray-800/30 border-gray-800 text-gray-400 hover:border-secondary/50 hover:text-white hover:bg-gray-800'
                        } ${!isEditing ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm">{categoria}</span>
                          {isSelected && <Heart className="w-4 h-4 fill-secondary text-secondary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!isEditing && (!profile.intereses || profile.intereses.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tienes intereses seleccionados</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startEditing}
                      className="mt-4 gap-2 border-secondary/30 hover:bg-secondary/10"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir intereses
                    </Button>
                  </div>
                )}

                {isEditing && (
                  <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                    <Button onClick={handleCancel} variant="outline" className="gap-2">
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      className="gap-2 bg-gradient-to-r from-secondary to-accent hover:opacity-90"
                      disabled={(formData.intereses || []).length === 0}
                    >
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Content - Eventos */}
          <TabsContent value="events" className="mt-6">
            <Card className="backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border border-accent/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Music className="w-5 h-5 text-accent" />
                  </div>
                  Mis Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEvents ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                  </div>
                ) : userEvents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {userEvents.map((event) => {
                      const isJoined = isUserJoined(event._id);

                      return (
                        <Card
                          key={event._id}
                          onClick={() => setSelectedEvent(event)}
                          className="group relative overflow-hidden rounded-2xl border-0 bg-[#0f0f0f] shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/30 cursor-pointer"
                        >
                          <div className="relative h-48 w-full overflow-hidden">
                            <ImageWithFallback
                              src={event.imageUrl || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80'}
                              alt={event.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            <Badge className="absolute left-3 top-3 bg-accent/90 text-white border-none">
                              {event.category || 'General'}
                            </Badge>

                            <Badge className="absolute right-12 top-3 bg-primary/90 text-white border-none font-bold">
                              {event.price > 0 ? `${event.price}€` : 'Gratis'}
                            </Badge>

                            <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm">
                              <Heart className="h-4 w-4 fill-primary text-primary" />
                            </div>
                          </div>

                          <CardContent className="p-5 space-y-4">
                            <div>
                              <h3 className="text-xl font-bold text-white line-clamp-1">{event.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <MapPin className="h-4 w-4 text-accent" />
                                <span className="truncate">
                                  {event.city || (event.location ? 'Ver Ubicación' : 'Ubicación secreta')}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-secondary" />
                                <span>{formatDate(event.schedule)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-accent" />
                                <span>{formatTime(event.schedule)}</span>
                              </div>
                              <div className="flex items-center gap-2 col-span-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>{event.participants ? event.participants.length : 0} asistirán</span>
                              </div>
                            </div>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinToggle(event._id);
                              }}
                              className={`w-full h-11 font-semibold transition-all duration-300 ${
                                isJoined
                                  ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,0,128,0.4)]'
                              }`}
                            >
                              {isJoined ? 'Ya estás apuntado' : 'Apuntarme'}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-accent/10 p-4 mb-4">
                      <Music className="h-10 w-10 text-accent/50" />
                    </div>
                    <h3 className="text-lg font-medium text-white">No tienes eventos</h3>
                    <p className="text-muted-foreground text-sm mt-2 max-w-sm">
                      Explora los eventos disponibles y apúntate a tus favoritos para verlos aquí.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2 border-accent/30 hover:bg-accent/10"
                      onClick={() => {
                        window.location.href = '/events';
                      }}
                    >
                      <Music className="w-4 h-4" />
                      Explorar eventos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modales - Completamente independientes del modo edición */}
      <ImageUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onUpload={handleAvatarUpload}
        currentImage={avatarUrl}
        title="Cambiar Avatar"
        type="avatar"
      />

      <ImageUploadModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        onUpload={handleCoverPhotoUpload}
        currentImage={coverUrl}
        title="Cambiar Foto de Portada"
        type="cover"
      />

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onJoinToggle={handleJoinToggle}
          isJoined={isUserJoined(selectedEvent._id)}
        />
      )}
    </div>
  );
}