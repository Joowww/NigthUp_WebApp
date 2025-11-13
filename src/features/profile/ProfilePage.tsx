import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Music, Calendar, Heart, MapPin, Edit, Save, Bell, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../AuthContext';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.username || 'Usuario',
    username: `@${user?.username || 'usuario'}`,
    email: user?.email || '',
    phone: '+34 600 123 456',
    bio: 'Amante de la música electrónica y las buenas fiestas. Siempre buscando nuevos eventos y experiencias.',
    city: 'Madrid',
    favoriteGenres: ['Electrónica', 'Techno', 'House'],
  });

  const stats = [
    { label: 'Eventos Asistidos', value: '24', icon: Music, color: 'from-[#ff0080] to-[#ff0080]/50' },
    { label: 'Próximos Eventos', value: '5', icon: Calendar, color: 'from-[#7928ca] to-[#7928ca]/50' },
    { label: 'Favoritos', value: '12', icon: Heart, color: 'from-[#00d9ff] to-[#00d9ff]/50' },
    { label: 'Discotecas', value: '8', icon: MapPin, color: 'from-[#50fa7b] to-[#50fa7b]/50' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Aquí iría la lógica para guardar los cambios
  };

  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4 border-2 border-[#ff0080]">
                    <AvatarFallback className="bg-gradient-to-br from-[#ff0080] to-[#7928ca] text-white text-2xl">
                      {user?.username.substring(0, 2).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-foreground mb-1">{profile.name}</h2>
                  <p className="text-muted-foreground mb-2">{profile.username}</p>
                  {user?.birthDate && (
                    <p className="text-muted-foreground mb-4">
                      Nacido el {new Date(user.birthDate).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {profile.favoriteGenres.map((genre, index) => (
                      <Badge 
                        key={index} 
                        className="bg-[#ff0080]/20 text-[#ff0080] border-[#ff0080]/30"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full border-[#ff0080]/30 text-[#ff0080]"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Perfil
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-border bg-card mt-6">
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-foreground">{stat.value}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="bg-card border-border disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="bg-card border-border disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="bg-card border-border disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="bg-card border-border disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="bg-card border-border disabled:opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="bg-card border-border disabled:opacity-70 min-h-[100px]"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-[#ff0080] to-[#7928ca]"
                      onClick={handleSave}
                    >
                      Guardar Cambios
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-border"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-[#00d9ff]" />
                    <div>
                      <p className="text-sm">Notificaciones</p>
                      <p className="text-xs text-muted-foreground">Gestiona tus preferencias de notificación</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Configurar</Button>
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-[#50fa7b]" />
                    <div>
                      <p className="text-sm">Privacidad y Seguridad</p>
                      <p className="text-xs text-muted-foreground">Control de privacidad y datos</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Gestionar</Button>
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5 text-[#ff0080]" />
                    <div>
                      <p className="text-sm">Cerrar Sesión</p>
                      <p className="text-xs text-muted-foreground">Salir de tu cuenta</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#ff0080]"
                    onClick={logout}
                  >
                    Salir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
