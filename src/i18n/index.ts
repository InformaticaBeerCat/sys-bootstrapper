import { isLocale, type Locale } from '../../electron/shared/config'
import { en } from './en'
import { es, type Dictionary } from './es'

export type { Dictionary }

export const DICTIONARIES: Record<Locale, Dictionary> = { es, en }

/** Nombre de cada idioma en su propio idioma, para el selector de Configuración. */
export const LOCALE_NAMES: Record<Locale, string> = {
  es: 'Español',
  en: 'English'
}

/**
 * Idioma a usar: el elegido por el usuario si hay uno válido; si no, el del sistema
 * (español para cualquier variante de español, inglés para todo lo demás).
 */
export function resolveLocale(preferred: Locale | null | undefined): Locale {
  if (isLocale(preferred)) return preferred
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}
