import { useState } from 'react'
import { LOCALES, type AppConfig, type Locale } from '../../electron/shared/config'
import { IconAlert, IconCheckCircle, IconFolder, IconFolderOpen, IconLanguage, IconTrash } from '../icons'
import { LOCALE_NAMES } from '../i18n'
import { ConfirmModal } from './modals/ConfirmModal'
import { useI18n } from '../contexts/I18nContext'
import { useToast } from '../contexts/ToastContext'

interface SettingsViewProps {
  config: AppConfig | null
  configPath: string
  defaultWorkingDirectory: string
}

export function SettingsView({ config: initialConfig, configPath, defaultWorkingDirectory }: SettingsViewProps) {
  const { showToast } = useToast()
  const { t, locale, setLocale } = useI18n()
  const [config, setConfig] = useState<AppConfig | null>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  async function handleSelectDirectory() {
    const selected = await window.sysBootstrapper.dialog.selectDirectory()
    if (!selected) return
    setSaving(true)
    try {
      const updated = await window.sysBootstrapper.config.setWorkingDirectory(selected)
      setConfig(updated)
      setSavedAt(Date.now())
      showToast(t.settings.directoryUpdated, 'success')
    } catch {
      showToast(t.settings.directorySaveError, 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleClearDirectory() {
    setShowClearConfirm(false)
    setSaving(true)
    try {
      const updated = await window.sysBootstrapper.config.setWorkingDirectory('')
      setConfig(updated)
      setSavedAt(Date.now())
      showToast(t.settings.directoryRemoved, 'success')
    } catch {
      showToast(t.settings.directoryRemoveError, 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleLanguageChange(next: Locale) {
    setSaving(true)
    try {
      setConfig(await setLocale(next))
    } catch {
      showToast(t.settings.languageSaveError, 'danger')
    } finally {
      setSaving(false)
    }
  }

  const hasWorkingDirectory = !!config?.workingDirectory

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">{t.nav.settings}</h1>
        <p className="view-description">{t.settings.description}</p>
      </div>

      <div className="panel">
        <h2 className="panel-title">
          <IconFolderOpen />
          {t.settings.workingDirectory}
        </h2>
        <p className="panel-hint">{t.settings.workingDirectoryHint}</p>

        <div className="field-row">
          <input
            className="text-input"
            type="text"
            readOnly
            placeholder={t.settings.noFolderSelected}
            value={config?.workingDirectory ?? ''}
          />
          <button type="button" className="btn btn-primary" onClick={handleSelectDirectory} disabled={saving}>
            <IconFolder />
            {hasWorkingDirectory ? t.settings.change : t.settings.chooseFolder}
          </button>
          {hasWorkingDirectory && (
            <button
              type="button"
              className="btn btn-ghost-danger"
              onClick={() => setShowClearConfirm(true)}
              disabled={saving}
            >
              <IconTrash />
              {t.settings.remove}
            </button>
          )}
        </div>

        {hasWorkingDirectory ? (
          <div className="status-line ok">
            <IconCheckCircle />
            {t.settings.directoryConfigured(!!savedAt)}
          </div>
        ) : (
          <>
            <div className="status-line warn">
              <IconAlert />
              {t.settings.directoryMissing}
            </div>
            {defaultWorkingDirectory && (
              <p className="panel-hint">{t.settings.defaultDirectory(<code>{defaultWorkingDirectory}</code>)}</p>
            )}
          </>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">
          <IconLanguage />
          {t.settings.language}
        </h2>
        <p className="panel-hint">{t.settings.languageHint}</p>

        <div className="field-row">
          <select
            className="text-input"
            value={locale}
            onChange={(event) => handleLanguageChange(event.target.value as Locale)}
            disabled={saving}
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_NAMES[code]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">{t.settings.configFile}</h2>
        <p className="panel-hint">{t.settings.configFileHint}</p>
        <div className="meta-list">
          <div>
            {t.settings.path} <code>{configPath || '…'}</code>
          </div>
          <div>
            {t.settings.lastUpdated}{' '}
            {config && config.updatedAt !== new Date(0).toISOString()
              ? new Date(config.updatedAt).toLocaleString(locale)
              : t.settings.notSavedYet}
          </div>
        </div>
      </div>

      {showClearConfirm && (
        <ConfirmModal
          title={t.settings.removeDirectoryTitle}
          message={t.settings.removeDirectoryMessage}
          confirmLabel={t.settings.remove}
          onConfirm={handleClearDirectory}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  )
}
