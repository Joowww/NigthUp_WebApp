import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

import { Button } from '../../ui/button'; 
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card } from '../../ui/card';
import { Lock, Mail, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password); 
      toast.success('¡Bienvenido '+email+'!');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al iniciar sesión');
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

      {/* ESTA ES LA CLASE CLAVE: bg-card/80 y backdrop-blur-sm */}
      <Card className="w-full max-w-md p-6 sm:p-8 z-10 bg-card/80 backdrop-blur-sm border-border/50">
        <div className="flex flex-col items-center space-y-2 mb-6">
          {/* Esta es la estrella (Sparkles) con su fondo degradado */ }
          <div className="p-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">
            ¡Bienvenido de nuevo!
          </h1>
          <p className="text-muted-foreground text-center">
            Inicia sesión para continuar
          </p>
        </div>

        <form className="space-y-6" onSubmit={submit}>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="tu@email.com"
              required
              /* ¡AQUÍ ESTÁ LA CORRECCIÓN! (Quitamos el className) */
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
              required
              /* ¡AQUÍ ESTÁ LA CORRECCIÓN! (Quitamos el className) */
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all relative overflow-hidden group"
          >
            <span className="relative z-10">Iniciar Sesión</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-muted-foreground">
              ¿No tienes cuenta?
            </span>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full border-border/50 hover:bg-muted/50 hover:border-primary transition-all"
        >
          <Link to="/register">
            Crear una cuenta
          </Link>
        </Button>
      </Card>
    </div>
  );
}