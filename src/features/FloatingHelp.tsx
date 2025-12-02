import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  X, 
  Settings, 
  Type, 
  ZapOff, 
  Check 
} from 'lucide-react';

export function FloatingHelp() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Estados para Conciencia Digital
  const [isLargeText, setIsLargeText] = useState(false);
  const [isLowMotion, setIsLowMotion] = useState(false);

  // Efecto: Cuando cambian los interruptores, ponemos/quitamos clases al BODY
useEffect(() => {
    // Modo Lectura (Texto Grande)
    if (isLargeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    // Modo Calma (Sin Animaciones)
    if (isLowMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [isLargeText, isLowMotion]);

  const languages = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ca', label: 'Català', flag: '🏴' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* 1. EL TELÓN INVISIBLE (BACKDROP) */}
      {/* Lo ponemos primero. Si está abierto, cubre la pantalla para detectar clics fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. MENÚ DESPLEGABLE */}
      {/* AÑADIDO 'relative z-50' para que flote ENCIMA del telón */}
      <div 
        className={`
          relative z-50 mb-4 w-72 origin-bottom-right rounded-2xl border border-[#ff0080]/30 
          bg-[#0f0f0f]/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}
        `}
        // AÑADIDO: Evita que los clics dentro del menú cierren el menú
        onClick={(e) => e.stopPropagation()} 
      >
        {/* SECCIÓN 1: IDIOMA */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Globe className="w-3 h-3" /> {t('common.language', 'Idioma')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg text-sm transition-all border
                  ${i18n.language.startsWith(lang.code)
                    ? 'bg-[#ff0080]/20 border-[#ff0080] text-white'
                    : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-white/10 my-4" />

        {/* SECCIÓN 2: CONCIENCIA DIGITAL */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Settings className="w-3 h-3" /> Conciencia Digital
          </h3>
          
          <div className="space-y-2">
            {/* Opción A: Modo Lectura */}
            <button
              onClick={() => setIsLargeText(!isLargeText)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                  <Type className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Modo Lectura</p>
                  <p className="text-xs text-gray-400">Aumentar texto</p>
                </div>
              </div>
              {/* Checkbox visual */}
              <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${isLargeText ? 'bg-[#ff0080] border-[#ff0080]' : 'border-gray-600'}`}>
                 {isLargeText && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>

            {/* Opción B: Modo Calma */}
            <button
              onClick={() => setIsLowMotion(!isLowMotion)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                  <ZapOff className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Modo Calma</p>
                  <p className="text-xs text-gray-400">Sin animaciones</p>
                </div>
              </div>
              {/* Checkbox visual */}
              <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${isLowMotion ? 'bg-[#ff0080] border-[#ff0080]' : 'border-gray-600'}`}>
                 {isLowMotion && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOTÓN FLOTANTE PRINCIPAL */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_0_20px_rgba(255,0,128,0.3)] 
          transition-all duration-300 border-2 border-white/10
          ${isOpen 
            ? 'bg-[#1a1a1a] text-white rotate-45' 
            : 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white hover:scale-110'
          }
        `}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
      </button>

    </div>
  );
}