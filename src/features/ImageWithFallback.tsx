// src/components/ImageWithFallback.tsx
import React from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallbackSrc = 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWdnYWV0b24lMjBwYXJ0eXxlbnwxfHx8fDE3NjAwNzg2Nzl8MA&ixlib=rb-4.1.0&q=80&w=400'
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = React.useState(src);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}