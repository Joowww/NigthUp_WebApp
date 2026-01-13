// src/features/ImageWithFallback.tsx
import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/images/businesses/default-disco.png'
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  // 🔄 Fallback de emergencia (imagen externa que siempre funciona)
  const emergencyFallback = 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&q=80';

  const handleError = () => {
    console.warn(`⚠️ Error cargando imagen: ${imgSrc}`);
    
    // Primera vez: intenta con el fallback local
    if (!hasError && !usedFallback) {
      console.log(`🔄 Intentando fallback local: ${fallbackSrc}`);
      setImgSrc(fallbackSrc);
      setUsedFallback(true);
      setHasError(true);
    } 
    // Segunda vez: usa el fallback de emergencia (imagen externa)
    else if (usedFallback && imgSrc !== emergencyFallback) {
      console.log(`🆘 Usando fallback de emergencia: ${emergencyFallback}`);
      setImgSrc(emergencyFallback);
    }
    // Tercera vez: ya no hay más opciones
    else {
      console.error(`❌ Todos los fallbacks fallaron`);
    }
  };

  const handleLoad = () => {
    if (imgSrc === emergencyFallback) {
      console.log(`✅ Fallback de emergencia cargado`);
    } else if (imgSrc === fallbackSrc) {
      console.log(`✅ Fallback local cargado`);
    } else {
      console.log(`✅ Imagen original cargada: ${imgSrc}`);
    }
  };

  return (
    <img
      src={imgSrc || emergencyFallback}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

// Export alternativo para compatibilidad con imports antiguos
export function ImageWithFallback_Legacy(props: ImageWithFallbackProps) {
  return <ImageWithFallback {...props} />;
}

// Default export para imports sin destructuring
export default ImageWithFallback;