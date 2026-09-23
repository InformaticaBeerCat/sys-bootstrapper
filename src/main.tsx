import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { I18nProvider } from './contexts/I18nContext'
import { ToastProvider } from './contexts/ToastContext'
import { resolveLocale } from './i18n'
import './styles/theme.css'
import './styles/app.css'

// El idioma se resuelve antes del primer render para no pintar la UI en un idioma y cambiarla al instante.
window.sysBootstrapper.config
  .get()
  .catch(() => null)
  .then((config) => {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
      <React.StrictMode>
        <I18nProvider initialLocale={resolveLocale(config?.language)}>
          <ToastProvider>
            <App />
          </ToastProvider>
        </I18nProvider>
      </React.StrictMode>
    )
  })
