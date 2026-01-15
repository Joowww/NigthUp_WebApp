// features/profile/ImageUploadModal.tsx
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  currentImage?: string;
  title: string;
  type: 'avatar' | 'cover';
}

export function ImageUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  currentImage, 
  title,
  type 
}: ImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await onUpload(selectedFile);
      handleClose();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            {type === 'avatar' ? (
              <Avatar className="w-32 h-32">
                <AvatarImage src={preview || currentImage || '/default-avatar.png'} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                <img 
                  src={preview || currentImage || '/default-cover.jpg'} 
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* File input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 gap-2"
              disabled={uploading}
            >
              <Upload className="w-4 h-4" />
              Seleccionar imagen
            </Button>

            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-secondary"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Subir
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}