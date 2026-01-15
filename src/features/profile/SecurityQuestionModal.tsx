// src/features/profile/SecurityQuestionModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../ui/select';
import { SECURITY_QUESTIONS } from '../../modules/user';

interface SecurityQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestionKey?: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onSetSecurityQuestion: (questionKey: string, answer: string, currentPassword: string) => Promise<void>;
}

export function SecurityQuestionModal({ 
  isOpen, 
  onClose,
  currentQuestionKey,
  onSuccess,
  onError,
  onSetSecurityQuestion 
}: SecurityQuestionModalProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [answer, setAnswer] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentQuestionKey) {
      setSelectedQuestion(currentQuestionKey);
    }
  }, [currentQuestionKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!selectedQuestion) {
      onError('Por favor selecciona una pregunta de seguridad');
      return;
    }

    if (!answer || answer.trim().length < 2) {
      onError('La respuesta debe tener al menos 2 caracteres');
      return;
    }

    if (!currentPassword) {
      onError('Por favor ingresa tu contraseña actual para confirmar');
      return;
    }

    try {
      setLoading(true);
      await onSetSecurityQuestion(selectedQuestion, answer.trim(), currentPassword);
      
      // Limpiar formulario
      setAnswer('');
      setCurrentPassword('');
      
      onSuccess('Pregunta de seguridad configurada correctamente');
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al configurar la pregunta de seguridad';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedQuestion(currentQuestionKey || '');
    setAnswer('');
    setCurrentPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Configurar Pregunta de Seguridad
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pregunta de seguridad */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Selecciona una pregunta
            </label>
            <Select 
              value={selectedQuestion} 
              onValueChange={setSelectedQuestion}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una pregunta" />
              </SelectTrigger>
              <SelectContent>
              {Object.entries(SECURITY_QUESTIONS).map(([key, question]) => (
                <SelectItem key={key} value={key}>
                    {question}
                </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Respuesta */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Tu respuesta
            </label>
            <Input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Escribe tu respuesta"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              💡 Asegúrate de recordar esta respuesta, la necesitarás para recuperar tu cuenta
            </p>
          </div>

          {/* Contraseña actual para confirmar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Contraseña actual (para confirmar)
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
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

          {/* Información */}
          {currentQuestionKey && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-400">
                ℹ️ Ya tienes una pregunta de seguridad configurada. Al guardar, se reemplazará por la nueva.
              </p>
            </div>
          )}

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
                  Guardando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}