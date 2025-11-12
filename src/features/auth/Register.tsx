import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerService } from './authService';
import type { User } from '../../modules/user';
import { toast } from 'react-toastify';

// NUEVAS IMPORTACIONES (del diseño de Figma y los iconos)
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card } from '../../ui/card';
// ¡AQUÍ ESTÁ EL ARREGLO DE ANTES!
import { Lock, Mail, User as UserIcon, Calendar, Sparkles } from 'lucide-react';

type RegisterFormData = User & {//añadimos el atributo a los que YA TIENE user
  confirmPassword?: string;
};

export const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();
  
  const navigate = useNavigate();

  // 'watch' nos deja ver el valor de 'password' para poder compararlo
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {

// esto basicamente esxluye el primer atributo del objeto data
// y crea un nou objecte sense aquest atribut
    const { confirmPassword, ...userCredentials } = data;

    const payload = {
      ...userCredentials, 
      role: 'user'
    };

    try {
      await registerService(payload);
      
      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login'); // Redirige al login
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error en el registro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background text-foreground">
      {/* Fondo con efectos neón (del figma) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl opacity-50 animate-pulse delay-2000" />
        <div className="absolute bottom-1/2 left-1/3 w-80 h-80 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 z-10 bg-card/80 backdrop-blur-sm border-border/50">
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="p-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">
            Crea tu cuenta
          </h1>
          <p className="text-muted-foreground text-center">
            Únete a la comunidad
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="tu_username"
              /* ¡AQUÍ ESTÁ LA CORRECCIÓN! */
              {...register('username', { required: 'El username es obligatorio' })}
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              /* ¡AQUÍ ESTÁ LA CORRECCIÓN! */
              {...register('email', { 
                required: 'El email es obligatorio',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "El formato del email no es válido"
                }
              })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha de Nacimiento
            </Label>
            <Input
              id="birthday"
              type="date"
              /* ¡AQUÍ ESTÁ LA CORRECCIÓN! */
              {...register('birthday', { 
                required: 'La fecha de nacimiento es obligatoria',
                valueAsDate: true, 
              })}
            />
            {errors.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'La contraseña es obligatoria' })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirmar Contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              /* ¡AQUÍ ESTÁ LA CORRECCIÓN! */
              {...register('confirmPassword', {
                required: 'Confirma la contraseña',
                validate: (value) =>
                  value === password || 'Las contraseñas no coinciden',
              })}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all relative overflow-hidden group mt-4"
          >
            <span className="relative z-10">Crear Cuenta</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-muted-foreground">
              ¿Ya tienes cuenta?
            </span>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full border-border/50 hover:bg-muted/50 hover:border-primary transition-all"
        >
          <Link to="/login">
            Iniciar Sesión
          </Link>
        </Button>
      </Card>
    </div>
  );
};