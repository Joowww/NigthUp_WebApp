import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Asegúrate de que estas rutas son correctas según donde creaste los JSON
import es from './assets/es.json';
import en from './assets/en.json';
import ca from './assets/ca.json';
import fr from './assets/fr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      ca: { translation: ca },
      fr: { translation: fr },
    },
    fallbackLng: 'es',
    interpolation: { escapeValue: false },

    react: {
      useSuspense: false
    }
  });

export default i18n;