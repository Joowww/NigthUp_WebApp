import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Edit, Save, X, Upload, MapPin, Calendar, Mail, Phone, User, Heart, Music, Clock,
     Users, Loader2, Plus, Lock, Shield, Star, Award, TrendingUp } from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ChangeEmailModal } from './ChangeEmailModal';
import { SecurityQuestionModal } from './SecurityQuestionModal';
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
import { trustService } from './TrustService';
import type { UserTrustStats } from '../../modules/userTrust';
import { getTrustLevelColor, getTrustLevelIcon } from '../../modules/userTrust';

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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSecurityQuestionModal, setShowSecurityQuestionModal] = useState(false);

  const [trustStats, setTrustStats] = useState<UserTrustStats | null>(null);
  const [trustRatings, setTrustRatings] = useState<any[]>([]);
  const [loadingTrust, setLoadingTrust] = useState(false);

  const [isExpandedView, setIsExpandedView] = useState(false);

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
      
      // Campos básicos
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
      
      // ✅ NUEVOS CAMPOS EXTENDIDOS (FASE 4)
      if (formData.firstName !== undefined && formData.firstName !== profile?.firstName) {
        changedFields.firstName = formData.firstName;
      }
      if (formData.lastName !== undefined && formData.lastName !== profile?.lastName) {
        changedFields.lastName = formData.lastName;
      }
      if (formData.bio !== undefined && formData.bio !== profile?.bio) {
        changedFields.bio = formData.bio;
      }
      if (formData.gender !== undefined && formData.gender !== profile?.gender) {
        changedFields.gender = formData.gender;
      }
      if (formData.city !== undefined && formData.city !== profile?.city) {
        changedFields.city = formData.city;
      }
      if (formData.country !== undefined && formData.country !== profile?.country) {
        changedFields.country = formData.country;
      }
      if (formData.website !== undefined && formData.website !== profile?.website) {
        changedFields.website = formData.website;
      }
      if (formData.socialMedia && JSON.stringify(formData.socialMedia) !== JSON.stringify(profile?.socialMedia)) {
        changedFields.socialMedia = formData.socialMedia;
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
      
      success('Perfil actualizado correctamente');
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
      intereses: profile?.intereses || [],
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      bio: profile?.bio || '',
      gender: profile?.gender || 'prefer_not_to_say',
      city: profile?.city || '',
      country: profile?.country || '',
      website: profile?.website || '',
      socialMedia: {
        instagram: profile?.socialMedia?.instagram || '',
        twitter: profile?.socialMedia?.twitter || '',
        facebook: profile?.socialMedia?.facebook || '',
        tiktok: profile?.socialMedia?.tiktok || ''
      }
    });
    setIsEditing(true);
  };
  
  // ✅ CANCELAR EDICIÓN DE CAMPOS DE TEXTO
  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };
  
  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsRefreshing(true);
      await userService.changePassword(currentPassword, newPassword);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleChangeEmail = async (newEmail: string, password: string) => {
    try {
      setIsRefreshing(true);
      const updatedUser = await userService.changeEmail(newEmail, password);
      
      setProfile(updatedUser);
      
      if (authUser) {
        updateUser({ ...authUser, ...updatedUser });
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleSetSecurityQuestion = async (questionKey: string, answer: string) => {
    try {
      setIsRefreshing(true);
      const updatedUser = await userService.setSecurityQuestion(questionKey, answer);
      
      setProfile(updatedUser);
      
      if (authUser) {
        updateUser({ ...authUser, ...updatedUser });
      }
    } finally {
      setIsRefreshing(false);
    }
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

  useEffect(() => {
    const fetchTrustData = async () => {
      if (!profile?._id) return;
      
      try {
        setLoadingTrust(true);
        const [stats, ratings] = await Promise.all([
          trustService.getUserTrustStats(profile._id),
          trustService.getUserRatings(profile._id)
        ]);
        
        console.log('Trust stats loaded:', stats);
        console.log('Trust ratings loaded:', ratings);
        
        setTrustStats(stats);
        setTrustRatings(ratings);
      } catch (error) {
        console.error('Error loading trust data:', error);
      } finally {
        setLoadingTrust(false);
      }
    };
  
    fetchTrustData();
  }, [profile?._id]);

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
        <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-xl border border-border/30">        <TabsTrigger value="info" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white transition-all">
            <User className="w-4 h-4 mr-2" />
            Información
        </TabsTrigger>
        <TabsTrigger value="interests" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:text-white transition-all">
            <Heart className="w-4 h-4 mr-2" />
            Intereses
        </TabsTrigger>
        <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all">
            <Lock className="w-4 h-4 mr-2" />
            Seguridad
        </TabsTrigger>
        <TabsTrigger value="reputation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all">
         <Star className="w-4 h-4 mr-2" />
             Reputación
        </TabsTrigger>
        <TabsTrigger value="events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent/80 data-[state=active]:text-white transition-all">
            <Music className="w-4 h-4 mr-2" />
            Eventos
        </TabsTrigger>
        </TabsList>

          {/* Tab Content - Información (con vista compacta y expandida) */}
        <TabsContent value="info" className="mt-6 space-y-4">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border border-primary/20 shadow-xl">
            <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                </div>
                Información Personal
                </div>
                {!isEditing && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpandedView(!isExpandedView)}
                    className="gap-2"
                >
                    {isExpandedView ? (
                    <>
                        <X className="w-4 h-4" />
                        Vista compacta
                    </>
                    ) : (
                    <>
                        <User className="w-4 h-4" />
                        Ver perfil completo
                    </>
                    )}
                </Button>
                )}
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            
            {/* ========== VISTA COMPACTA (siempre visible) ========== */}
            <div className="space-y-4">
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
                    />
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
                    />
                </div>
                </div>
            </div>

            {/* ========== VISTA EXPANDIDA (solo si isExpandedView || isEditing) ========== */}
            {(isExpandedView || isEditing) && (
                <div className="space-y-6 pt-6 border-t border-border/50 animate-in slide-in-from-top-4 duration-300">
                
                {/* Información personal extendida */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-500" />
                    Datos Personales
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                        <Input
                        name="firstName"
                        value={isEditing ? (formData.firstName || '') : (profile.firstName || 'No especificado')}
                        disabled={!isEditing}
                        onChange={handleInputChange}
                        className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 bg-background/50"
                        placeholder="Tu nombre"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Apellidos</label>
                        <Input
                        name="lastName"
                        value={isEditing ? (formData.lastName || '') : (profile.lastName || 'No especificado')}
                        disabled={!isEditing}
                        onChange={handleInputChange}
                        className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 bg-background/50"
                        placeholder="Tus apellidos"
                        />
                    </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Ciudad
                        </label>
                        <Input
                        name="city"
                        value={isEditing ? (formData.city || '') : (profile.city || 'No especificada')}
                        disabled={!isEditing}
                        onChange={handleInputChange}
                        className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 bg-background/50"
                        placeholder="Tu ciudad"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        País
                        </label>
                        <Input
                        name="country"
                        value={isEditing ? (formData.country || '') : (profile.country || 'No especificado')}
                        disabled={!isEditing}
                        onChange={handleInputChange}
                        className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 bg-background/50"
                        placeholder="Tu país"
                        />
                    </div>
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Género</label>
                    {isEditing ? (
                        <select
                        name="gender"
                        value={formData.gender || profile.gender || 'prefer_not_to_say'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                        >
                        <option value="prefer_not_to_say">Prefiero no decirlo</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                        </select>
                    ) : (
                        <Input
                        value={
                            profile.gender === 'male' ? 'Masculino' :
                            profile.gender === 'female' ? 'Femenino' :
                            profile.gender === 'other' ? 'Otro' :
                            'Prefiero no decirlo'
                        }
                        disabled
                        className="bg-muted/50 cursor-not-allowed"
                        />
                    )}
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Biografía</label>
                    <textarea
                        name="bio"
                        value={isEditing ? (formData.bio || '') : (profile.bio || 'Sin biografía')}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        maxLength={500}
                        className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        placeholder="Cuéntanos sobre ti..."
                    />
                    {isEditing && (
                        <p className="text-xs text-muted-foreground text-right">
                        {(formData.bio || '').length}/500 caracteres
                        </p>
                    )}
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Sitio Web</label>
                    <Input
                        name="website"
                        type="url"
                        value={isEditing ? (formData.website || '') : (profile.website || 'No especificado')}
                        disabled={!isEditing}
                        onChange={handleInputChange}
                        className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 bg-background/50"
                        placeholder="https://tusitio.com"
                    />
                    </div>
                </div>

                {/* Redes sociales */}
                <div className="space-y-4 pt-6 border-t border-border/50">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Redes Sociales
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                    {/* Instagram */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                        </label>
                        <Input
                        name="instagram"
                        value={isEditing ? (formData.socialMedia?.instagram || '') : (profile.socialMedia?.instagram || 'No especificado')}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                        })}
                        className="transition-all duration-300 focus:ring-2 focus:ring-pink-500 bg-background/50"
                        placeholder="@tuusuario"
                        />
                    </div>

                    {/* Twitter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Twitter
                        </label>
                        <Input
                        name="twitter"
                        value={isEditing ? (formData.socialMedia?.twitter || '') : (profile.socialMedia?.twitter || 'No especificado')}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                        })}
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 bg-background/50"
                        placeholder="@tuusuario"
                        />
                    </div>

                    {/* Facebook */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                        </label>
                        <Input
                        name="facebook"
                        value={isEditing ? (formData.socialMedia?.facebook || '') : (profile.socialMedia?.facebook || 'No especificado')}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                        })}
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-600 bg-background/50"
                        placeholder="tu.perfil"
                        />
                    </div>

                    {/* TikTok */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        TikTok
                        </label>
                        <Input
                        name="tiktok"
                        value={isEditing ? (formData.socialMedia?.tiktok || '') : (profile.socialMedia?.tiktok || 'No especificado')}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            socialMedia: { ...formData.socialMedia, tiktok: e.target.value }
                        })}
                        className="transition-all duration-300 focus:ring-2 focus:ring-pink-500 bg-background/50"
                        placeholder="@tuusuario"
                        />
                    </div>
                    </div>
                </div>
                </div>
            )}

            {/* Botones de guardar/cancelar */}
            {isEditing && (
                <div className="flex justify-end gap-2 pt-6 border-t border-border/50">
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

               {/* Tab Content - Seguridad */}
        <TabsContent value="security" className="mt-6">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border border-yellow-500/20 shadow-xl">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Lock className="w-5 h-5 text-yellow-500" />
                </div>
                Seguridad y Privacidad
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {/* Cambiar contraseña */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20 hover:border-primary/40 transition-all group">
                <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-white">Contraseña</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                    Cambia tu contraseña para mantener tu cuenta segura
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordModal(true)}
                    className="ml-4 border-primary/30 hover:bg-primary/10"
                >
                    Cambiar
                </Button>
                </div>
            </div>

            {/* Cambiar email */}
            <div className="p-4 bg-gradient-to-r from-secondary/10 to-transparent rounded-xl border border-secondary/20 hover:border-secondary/40 transition-all group">
                <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-5 h-5 text-secondary" />
                    <h3 className="font-semibold text-white">Email</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                    Email actual: <span className="text-white font-medium">{profile.email}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                    Cambia el email asociado a tu cuenta
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmailModal(true)}
                    className="ml-4 border-secondary/30 hover:bg-secondary/10"
                >
                    Cambiar
                </Button>
                </div>
            </div>

            {/* Pregunta de seguridad */}
            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all group">
                <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-white">Pregunta de Seguridad</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                    {profile.securityQuestion 
                        ? '✅ Configurada - Te ayudará a recuperar tu cuenta' 
                        : '⚠️ No configurada - Configúrala para mayor seguridad'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecurityQuestionModal(true)}
                    className="ml-4 border-yellow-500/30 hover:bg-yellow-500/10"
                >
                    {profile.securityQuestion ? 'Cambiar' : 'Configurar'}
                </Button>
                </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                <p className="text-xs text-blue-400 flex items-start gap-2">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                    <strong>Consejo de seguridad:</strong> Usa una contraseña única y fuerte. Nunca compartas tus credenciales con nadie.
                </span>
                </p>
            </div>
            </CardContent>
        </Card>
        </TabsContent> 

            {/* Tab Content - Reputación */}
            <TabsContent value="reputation" className="mt-6">
            <Card className="backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 border border-green-500/20 shadow-xl">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                    <Star className="w-5 h-5 text-green-500" />
                    </div>
                    Reputación y Confianza
                </CardTitle>
                </CardHeader>
                <CardContent>
                {loadingTrust ? (
                    <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                    </div>
                ) : (
                    <div className="space-y-6">
                    {/* Estadísticas principales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Puntuación promedio */}
                        <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20 text-center">
                        <div className="flex justify-center mb-2">
                            <Star className="w-8 h-8 text-green-500 fill-green-500" />
                        </div>
                        <p className="text-4xl font-bold text-green-500">
                            {trustStats?.averageScore?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Puntuación Media</p>
                        </div>

                        {/* Total de valoraciones */}
                        <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-xl border border-blue-500/20 text-center">
                        <div className="flex justify-center mb-2">
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-4xl font-bold text-blue-500">
                            {trustStats?.totalRatings || 0}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Valoraciones</p>
                        </div>

                        {/* Nivel de confianza */}
                        <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 rounded-xl border border-yellow-500/20 text-center">
                        <div className="flex justify-center mb-2">
                            <Award className="w-8 h-8 text-yellow-500" />
                        </div>
                        <p className={`text-4xl font-bold ${getTrustLevelColor(trustStats?.trustLevel || 'Nuevo')}`}>
                            {getTrustLevelIcon(trustStats?.trustLevel || 'Nuevo')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {trustStats?.trustLevel || 'Nuevo'}
                        </p>
                        </div>
                    </div>

                    {/* Distribución de puntuaciones */}
                    {trustStats && trustStats.totalRatings > 0 && (
                        <div className="p-6 bg-gradient-to-br from-card/50 to-card/30 rounded-xl border border-border/50">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            Distribución de Puntuaciones
                        </h3>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((stars) => {
                            const count = trustStats.scoreDistribution?.[stars as keyof typeof trustStats.scoreDistribution] || 0;
                            const percentage = trustStats.totalRatings > 0 
                                ? (count / trustStats.totalRatings) * 100 
                                : 0;

                            return (
                                <div key={stars} className="flex items-center gap-3">
                                <div className="flex gap-1 w-24">
                                    {[...Array(stars)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                                    <div 
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground w-12 text-right">
                                    {count}
                                </span>
                                </div>
                            );
                            })}
                        </div>
                        </div>
                    )}

                    {/* Lista de valoraciones */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Valoraciones Recibidas</h3>
                        {trustRatings.length > 0 ? (
                        <div className="space-y-3">
                            {trustRatings.map((rating) => (
                            <div 
                                key={rating._id} 
                                className="p-4 bg-gradient-to-r from-card/50 to-card/30 rounded-xl border border-border/50 hover:border-green-500/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border-2 border-green-500/30">
                                    <AvatarImage 
                                        src={rating.rater?.avatar || '/default-avatar.png'} 
                                        alt={rating.rater?.username || 'Usuario'} 
                                    />
                                    <AvatarFallback>
                                        {rating.rater?.username?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                    </Avatar>
                                    <div>
                                    <p className="font-medium text-white">
                                        {rating.rater?.username || 'Usuario'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(rating.createdAt).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                        })}
                                    </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`w-4 h-4 ${
                                        i < rating.score 
                                            ? 'fill-yellow-500 text-yellow-500' 
                                            : 'text-gray-600'
                                        }`}
                                    />
                                    ))}
                                </div>
                                </div>
                                {rating.comment && (
                                <p className="text-sm text-muted-foreground mt-2 pl-13">
                                    "{rating.comment}"
                                </p>
                                )}
                                {rating.context && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-500/10 text-green-500 rounded-md">
                                    {rating.context}
                                </span>
                                )}
                            </div>
                            ))}
                        </div>
                        ) : (
                        <div className="text-center py-12">
                            <Star className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">Aún no tienes valoraciones</p>
                            <p className="text-sm text-muted-foreground/70 mt-2">
                            Las valoraciones de otros usuarios aparecerán aquí
                            </p>
                        </div>
                        )}
                    </div>
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

            {/* Modales de imágenes */}
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

        {/* Modales de seguridad */}
        <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={success}
            onError={error}
            onChangePassword={handleChangePassword}
        />

        <ChangeEmailModal
            isOpen={showEmailModal}
            onClose={() => setShowEmailModal(false)}
            currentEmail={profile.email}
            onSuccess={success}
            onError={error}
            onChangeEmail={handleChangeEmail}
        />

        <SecurityQuestionModal
            isOpen={showSecurityQuestionModal}
            onClose={() => setShowSecurityQuestionModal(false)}
            currentQuestionKey={profile.securityQuestion}
            onSuccess={success}
            onError={error}
            onSetSecurityQuestion={handleSetSecurityQuestion}
        />

        {/* Modal de eventos */}
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