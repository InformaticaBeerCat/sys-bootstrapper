export interface AppConfig {
  /** Carpeta donde se guardarán los archivos generados por la app. Vacío si aún no se ha elegido. */
  workingDirectory: string
  /** Marca de tiempo ISO de la última modificación del archivo de configuración. */
  updatedAt: string
}

export const DEFAULT_CONFIG: AppConfig = {
  workingDirectory: '',
  updatedAt: new Date(0).toISOString()
}
