import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react'; // Importamos el icono
import { cn } from '../ui/utils'; // Importamos tu función 'cn' (ajusta la ruta si es necesario)

// Tu imagen de error SVG (si la prefieres, pero el icono es más limpio)
// const ERROR_IMG_SRC = 'data:image/svg+xml;base64,...'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, ...rest } = props;

  // Si hay error (o no hay src), mostramos el placeholder oscuro
  if (didError || !src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground', // <-- ESTO ES LO QUE CAMBIA (usa tus colores de tema)
          className, // Pasamos el className original (para el tamaño, etc.)
        )}
        style={style}
      >
        <ImageIcon className="w-1/4 h-1/4" />
      </div>
    );
  }

  // Si todo va bien, mostramos la imagen
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}