export const LOCALES = ['es', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale)
}

export interface AppConfig {
  /** Carpeta donde se guardarán los archivos generados por la app. Vacío si aún no se ha elegido. */
  workingDirectory: string
  /** Idioma de la interfaz. null si aún no se ha elegido (se usa el idioma del sistema). */
  language: Locale | null
  /** Marca de tiempo ISO de la última modificación del archivo de configuración. */
  updatedAt: string
}

export const DEFAULT_CONFIG: AppConfig = {
  workingDirectory: '',
  language: null,
  updatedAt: new Date(0).toISOString()
}
