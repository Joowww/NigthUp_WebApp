import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "text-3xl" }) => {
  return (
    // Usamos flex para centrar si hace falta y aplicamos los estilos
    <div className={`font-black italic tracking-wider flex items-center ${className}`}>
      {/* Estilo: Texto blanco con un drop-shadow sutil para que resalte sobre fondos oscuros,
         imitando el estilo de la imagen enviada.
      */}
      <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
        NIGHT UP
      </span>
    </div>
  );
};

export default Logo;