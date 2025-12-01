import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerService } from './authService';
import type { User } from '../../modules/user';
import { toast } from 'react-toastify';

import Logo from '../../ui/Logo';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card } from '../../ui/card';

import { Lock, Mail, User as UserIcon, Calendar, Phone, ShieldQuestion, KeyRound } from 'lucide-react';
type RegisterFormData = User & {
  confirmPassword?: string;
};

const SECURITY_QUESTIONS = [
  { key: "security.question.pet_name", label: "¿Cuál es el nombre de tu primera mascota?" },
  { key: "security.question.birth_city", label: "¿En qué ciudad naciste?" },
  { key: "security.question.mother_maiden_name", label: "¿Cuál es el nombre de soltera de tu madre?" },
  { key: "security.question.first_school", label: "¿Cuál fue el nombre de tu primera escuela?" },
  { key: "security.question.favorite_food", label: "¿Cuál es tu comida favorita?" },
  { key: "security.question.childhood_street", label: "¿En qué calle vivías cuando eras niño?" },
  { key: "security.question.best_friend", label: "¿Cuál es el nombre de tu mejor amigo de la infancia?" },
  { key: "security.question.first_job", label: "¿Cuál fue tu primer trabajo?" },
  { key: "security.question.favorite_book", label: "¿Cuál es el nombre de tu libro favorito?" },
  { key: "security.question.birth_hospital", label: "¿En qué hospital naciste?" },
  { key: "security.question.father_middle_name", label: "¿Cuál es el segundo nombre de tu padre?" },
  { key: "security.question.first_car", label: "¿Cuál fue el modelo de tu primer coche?" },
  { key: "security.question.favorite_teacher", label: "¿Cuál es el nombre de tu profesor favorito?" },
  { key: "security.question.graduation_year", label: "¿En qué año te graduaste de la secundaria?" },
  { key: "security.question.favorite_movie", label: "¿Cuál es el nombre de tu película favorita?" }];

export const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();
  
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-y-auto py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />

      <Card className="w-full max-w-md p-8 space-y-6 bg-card/80 backdrop-blur border-border/50 shadow-2xl relative z-10 my-4">
        
        <div className="flex justify-center mb-2">
            <Logo className="text-4xl justify-center" />
        </div>
        
        <div className="space-y-2 text-center">
          <h2 className="text-xl text-muted-foreground font-medium">
            Crear Cuenta
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* USERNAME */}
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                id="username"
                placeholder="Tu nombre de usuario"
                className="pl-10"
                {...register('username', { required: 'El usuario es obligatorio' })}
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                className="pl-10"
                {...register('email', { required: 'El correo es obligatorio' })}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

           {/* TELÉFONO */}
           <div className="space-y-2">
            <Label htmlFor="phoneNumber">Teléfono</Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+34 600 000 000"
                className="pl-10"
                {...register('phoneNumber', { 
                  required: 'El teléfono es obligatorio',
                  pattern: {
                    value: /^[\d\s\-\+\(\)]+$/,
                    message: 'Formato no válido'
                  }
                })}
              />
            </div>
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
          </div>

          {/* FECHA NACIMIENTO */}
          <div className="space-y-2">
            <Label htmlFor="birthday">Fecha de Nacimiento</Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                id="birthday"
                type="date"
                className="pl-10"
                {...register('birthday', { required: 'Fecha requerida' })}
              />
            </div>
            {errors.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday.message}</p>}
          </div>

          {/* --- NUEVOS CAMPOS DE SEGURIDAD --- */}
          
          {/* Pregunta de Seguridad (Select) */}
          <div className="space-y-2">
            <Label htmlFor="securityQuestionKey">Pregunta de Seguridad</Label>
            <div className="relative group">
              <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              {/* Usamos un select nativo pero con las clases del Input para que se vea igual */}
              <select
                id="securityQuestionKey"
                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none"
                {...register('securityQuestionKey', { required: 'Selecciona una pregunta' })}
              >
                <option value="">Selecciona una pregunta...</option>
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q.key} value={q.key} className="bg-card text-foreground">
                    {q.label}
                  </option>
                ))}
              </select>
              {/* Flechita del select */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            {errors.securityQuestionKey && <p className="text-red-500 text-xs mt-1">{errors.securityQuestionKey.message}</p>}
          </div>

          {/* Respuesta de Seguridad (Input) */}
          <div className="space-y-2">
            <Label htmlFor="securityAnswer">Respuesta</Label>
            <div className="relative group">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                id="securityAnswer"
                type="text"
                placeholder="Tu respuesta secreta"
                className="pl-10"
                {...register('securityAnswer', { required: 'La respuesta es obligatoria' })}
              />
            </div>
            {errors.securityAnswer && <p className="text-red-500 text-xs mt-1">{errors.securityAnswer.message}</p>}
          </div>
          {/* ---------------------------------- */}


          {/* PASSWORD */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register('password', { 
                  required: 'Contraseña obligatoria',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' } 
                })}
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register('confirmPassword', {
                  validate: (value) => value === password || 'Las contraseñas no coinciden',
                })}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-4 font-bold py-3">
            Crear Cuenta
          </Button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-card px-4 text-gray-400 text-sm">¿Ya tienes cuenta?</span>
            </div>
        </div>

        <Button asChild variant="outline" className="w-full border-gray-700 hover:bg-gray-800 hover:text-white py-3">
          <Link to="/login">Iniciar Sesión</Link>
        </Button>
      </Card>
    </div>
  );
};