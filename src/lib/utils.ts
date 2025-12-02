import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import i18n from 'i18next';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const translateText = (text: string | undefined): string => {
  if (!text) return '';

  // 1. Intento exacto (para categorías o ciudades)
  const exactKey = `dictionary.${text}`;
  const exactTranslation = i18n.t(exactKey);
  if (exactTranslation !== exactKey && exactTranslation !== text) {
    return exactTranslation;
  }

  // 2. Intento "Fuerza Bruta" (palabra por palabra)
  return text.split(' ').map((word) => {
    // Limpiar puntuación simple (comas, puntos)
    const cleanWord = word.replace(/[.,¡!¿?]/g, '').toLowerCase(); 
    const punctuation = word.replace(/[^.,¡!¿?]/g, ''); // Guardar la puntuación original
    
    // Buscar en el diccionario (en minúsculas)
    const dictKey = `dictionary.${cleanWord}`;
    let translation = i18n.t(dictKey);

    // Si no encuentra traducción, devuelve la key. Si es así, devolvemos la palabra original.
    if (translation === dictKey) {
        return word; 
    }

    // Mantener mayúscula inicial si la tenía
    if (word[0] === word[0].toUpperCase() && /^[a-z]/.test(cleanWord)) {
        translation = translation.charAt(0).toUpperCase() + translation.slice(1);
    }

    return translation + punctuation;
  }).join(' ');
};