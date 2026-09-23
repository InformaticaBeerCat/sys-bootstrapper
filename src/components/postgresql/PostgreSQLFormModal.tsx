import { useEffect, useState } from 'react'
import type { PostgreSQLPrivilegePreset, PostgreSQLScriptInput } from '../../../electron/shared/databases/postgresql'
import { useI18n } from '../../contexts/I18nContext'
import { Modal } from '../modals/Modal'
import { generatePostgreSQLPassword } from './generatePostgreSQLPassword'

const PRESET_PRIVILEGES: Record<string, string> = {
  produccion: 'SELECT, INSERT, UPDATE, DELETE',
  desarrollo: 'ALL PRIVILEGES',
  solo_lectura: 'SELECT'
}

type HostMode = 'local' | 'todas' | 'custom'

function detectHostMode(host: string): HostMode {
  if (host === '127.0.0.1/32') return 'local'
  if (host === '0.0.0.0/0') return 'todas'
  return 'custom'
}

const EMPTY_VALUES: PostgreSQLScriptInput = {
  dbName: '',
  userName: '',
  userPassword: '',
  privileges: '',
  preset: 'personalizado',
  encoding: 'UTF8',
  allowedHost: '127.0.0.1/32'
}

interface PostgreSQLFormModalProps {
  mode: 'create' | 'edit'
  initialValues?: PostgreSQLScriptInput
  onCancel: () => void
  onSave: (values: PostgreSQLScriptInput) => void
}

export function PostgreSQLFormModal({ mode, initialValues, onCancel, onSave }: PostgreSQLFormModalProps) {
  const { t } = useI18n()
  const [values, setValues] = useState<PostgreSQLScriptInput>(initialValues ?? EMPTY_VALUES)
  const [hostMode, setHostMode] = useState<HostMode>(detectHostMode((initialValues ?? EMPTY_VALUES).allowedHost))
  const [showPassword, setShowPassword] = useState(false)

  function update<K extends keyof PostgreSQLScriptInput>(key: K, value: PostgreSQLScriptInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    if (values.preset !== 'personalizado') {
      update('privileges', PRESET_PRIVILEGES[values.preset] ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.preset])

  function handleHostModeChange(mode: HostMode) {
    setHostMode(mode)
    if (mode === 'local') update('allowedHost', '127.0.0.1/32')
    else if (mode === 'todas') update('allowedHost', '0.0.0.0/0')
    else update('allowedHost', '')
  }

  const error =
    !values.dbName.trim() ||
    !values.userName.trim() ||
    !values.userPassword.trim() ||
    !values.privileges.trim() ||
    !values.allowedHost.trim()
      ? t.database.allRequired
      : null

  return (
    <Modal
      title={mode === 'create' ? t.database.newTitle('PostgreSQL') : t.database.editTitle('PostgreSQL')}
      onClose={onCancel}
      size="lg"
      footer={(requestClose) => (
        <>
          <button type="button" className="btn" onClick={() => requestClose(onCancel)}>
            {t.common.cancel}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!!error}
            onClick={() => requestClose(() => onSave(values))}
          >
            {mode === 'create' ? t.common.create : t.common.saveChanges}
          </button>
        </>
      )}
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.database.dbNameInput}</label>
          <input
            className="text-input"
            type="text"
            placeholder={t.database.dbNamePlaceholder}
            value={values.dbName}
            onChange={(event) => update('dbName', event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t.postgresql.userRole}</label>
          <input
            className="text-input"
            type="text"
            placeholder={t.database.userPlaceholder}
            value={values.userName}
            onChange={(event) => update('userName', event.target.value)}
          />
        </div>
      </div>

      <div className="form-row form-row-1">
        <div className="form-group">
          <label className="form-label">{t.database.password}</label>
          <div className="field-row">
            <input
              className="text-input"
              type={showPassword ? 'text' : 'password'}
              placeholder={t.database.passwordPlaceholder}
              value={values.userPassword}
              onChange={(event) => update('userPassword', event.target.value)}
            />
            <button type="button" className="btn btn-sm" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
              {showPassword ? t.common.hide : t.common.show}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => update('userPassword', generatePostgreSQLPassword(20))}
            >
              {t.database.generatePassword}
            </button>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.database.privilegesPreset}</label>
          <select
            className="text-input"
            value={values.preset}
            onChange={(event) => update('preset', event.target.value as PostgreSQLPrivilegePreset)}
          >
            <option value="personalizado">{t.database.presets.personalizado}</option>
            <option value="produccion">{t.postgresql.presetOptions.produccion}</option>
            <option value="desarrollo">{t.postgresql.presetOptions.desarrollo}</option>
            <option value="solo_lectura">{t.database.presets.solo_lectura}</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t.postgresql.tablePrivilegesInput}</label>
          <input
            className="text-input"
            type="text"
            placeholder={t.database.privilegesPlaceholder}
            value={values.privileges}
            onChange={(event) => update('privileges', event.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.postgresql.allowedConnectionsInput}</label>
          <select className="text-input" value={hostMode} onChange={(event) => handleHostModeChange(event.target.value as HostMode)}>
            <option value="local">{t.postgresql.hostLocal}</option>
            <option value="todas">{t.postgresql.hostAll}</option>
            <option value="custom">{t.postgresql.hostCustom}</option>
          </select>
          {hostMode === 'custom' && (
            <input
              className="text-input"
              type="text"
              placeholder={t.postgresql.hostPlaceholder}
              value={values.allowedHost}
              onChange={(event) => update('allowedHost', event.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
        <div className="form-group">
          <label className="form-label">{t.postgresql.encodingInput}</label>
          <select className="text-input" value={values.encoding} onChange={(event) => update('encoding', event.target.value)}>
            <option value="UTF8">{t.postgresql.utf8}</option>
            <option value="LATIN1">LATIN1</option>
            <option value="SQL_ASCII">SQL_ASCII</option>
            <option value="WIN1252">WIN1252</option>
          </select>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
    </Modal>
  )
}
