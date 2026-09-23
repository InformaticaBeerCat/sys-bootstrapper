import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppConfig, Locale } from '../../electron/shared/config'
import { DICTIONARIES, type Dictionary } from '../i18n'

interface I18nContextValue {
  locale: Locale
  t: Dictionary
  /** Cambia el idioma y lo persiste en config.json; devuelve la configuración actualizada. */
  setLocale: (locale: Locale) => Promise<AppConfig>
}

const I18nContext = createContext<I18nContextValue | null>(null)

interface I18nProviderProps {
  initialLocale: Locale
  children: ReactNode
}

export function I18nProvider({ initialLocale, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback(async (next: Locale) => {
    const updated = await window.sysBootstrapper.config.setLanguage(next)
    setLocaleState(next)
    return updated
  }, [])

  const value = useMemo(() => ({ locale, t: DICTIONARIES[locale], setLocale }), [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n debe usarse dentro de <I18nProvider>')
  return ctx
}
