// src/utils/profanityFilter.ts

const BAD_WORDS = [
    'puta', 'puto', 'mierda', 'gilipollas', 'cabron', 'cabrona', 'zorra', 'zorro',
    'maricon', 'maricona', 'fuck', 'shit', 'bitch', 'asshole', 'idiota', 'estupido',
    'joder', 'coño', 'pendejo', 'pendeja', 'culiao', 'culiao', 'weon', 'weona'
];

/**
 * Censura palabras malsonantes en un texto.
 * @param text Texto a procesar
 * @returns Texto con las palabras censuradas
 */
export function censorText(text: string): string {
    if (!text) return '';

    let censoredText = text;

    BAD_WORDS.forEach(word => {
        // Escapar caracteres especiales y crear regex global e insensible a mayúsculas
        const regex = new RegExp(`\\b${word}\\b`, 'gi');

        censoredText = censoredText.replace(regex, (match) => {
            // Reemplazar con asteriscos manteniendo la longitud
            return '*'.repeat(match.length);
        });
    });

    return censoredText;
}

/**
 * Verifica si un texto contiene palabras malsonantes.
 */
export function containsProfanity(text: string): boolean {
    if (!text) return false;
    return BAD_WORDS.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(text);
    });
}
