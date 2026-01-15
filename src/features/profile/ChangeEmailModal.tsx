// src/features/profile/ChangeEmailModal.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Mail, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onChangeEmail: (newEmail: string, password: string) => Promise<void>;
}

export function ChangeEmailModal({ 
  isOpen, 
  onClose,
  currentEmail,
  onSuccess,
  onError,
  onChangeEmail 
}: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!newEmail || !password) {
      onError('Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      onError('El email no es válido');
      return;
    }

    if (newEmail === currentEmail) {
      onError('El nuevo email debe ser diferente al actual');
      return;
    }

    try {
      setLoading(true);
      await onChangeEmail(newEmail, password);
      
      // Limpiar formulario
      setNewEmail('');
      setPassword('');
      
      onSuccess('Email cambiado correctamente');
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al cambiar el email';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewEmail('');
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Cambiar Email
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email actual */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email actual
            </label>
            <Input
              type="email"
              value={currentEmail}
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>

          {/* Nuevo email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Nuevo email
            </label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="ejemplo@email.com"
              disabled={loading}
            />
          </div>

          {/* Contraseña para confirmar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Contraseña (para confirmar)
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-500">
              Tendrás que iniciar sesión nuevamente con tu nuevo email
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cambiando...
                </>
              ) : (
                'Cambiar email'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}