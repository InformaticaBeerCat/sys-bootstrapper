import { useEffect, useState } from 'react'
import type { MySQLPrivilegePreset, MySQLScriptInput } from '../../../electron/shared/databases/mysql'
import { useI18n } from '../../contexts/I18nContext'
import { Modal } from '../modals/Modal'
import { generateMySQLPassword } from './generateMySQLPassword'

const PRESET_PRIVILEGES: Record<string, string> = {
  produccion: 'SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, TRIGGER, REFERENCES',
  desarrollo: 'ALL PRIVILEGES',
  solo_lectura: 'SELECT'
}

type HostMode = 'localhost' | '%' | 'custom'

function detectHostMode(host: string): HostMode {
  if (host === 'localhost' || host === '%') return host
  return 'custom'
}

const EMPTY_VALUES: MySQLScriptInput = {
  dbName: '',
  userName: '',
  userPassword: '',
  privileges: '',
  host: 'localhost',
  preset: 'personalizado',
  charset: 'utf8mb4'
}

interface MySQLFormModalProps {
  mode: 'create' | 'edit'
  initialValues?: MySQLScriptInput
  onCancel: () => void
  onSave: (values: MySQLScriptInput) => void
}

export function MySQLFormModal({ mode, initialValues, onCancel, onSave }: MySQLFormModalProps) {
  const { t } = useI18n()
  const [values, setValues] = useState<MySQLScriptInput>(initialValues ?? EMPTY_VALUES)
  const [hostMode, setHostMode] = useState<HostMode>(detectHostMode((initialValues ?? EMPTY_VALUES).host))
  const [showPassword, setShowPassword] = useState(false)

  function update<K extends keyof MySQLScriptInput>(key: K, value: MySQLScriptInput[K]) {
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
    if (mode !== 'custom') update('host', mode)
    else update('host', '')
  }

  const error = !values.dbName.trim() || !values.userName.trim() || !values.userPassword.trim() || !values.privileges.trim() || !values.host.trim()
    ? t.database.allRequired
    : null

  return (
    <Modal
      title={mode === 'create' ? t.database.newTitle('MySQL') : t.database.editTitle('MySQL')}
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
          <label className="form-label">{t.database.user}</label>
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
              onClick={() => update('userPassword', generateMySQLPassword(20))}
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
            onChange={(event) => update('preset', event.target.value as MySQLPrivilegePreset)}
          >
            <option value="personalizado">{t.database.presets.personalizado}</option>
            <option value="produccion">{t.database.presets.produccion}</option>
            <option value="desarrollo">{t.database.presets.desarrollo}</option>
            <option value="solo_lectura">{t.database.presets.solo_lectura}</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t.database.privileges}</label>
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
          <label className="form-label">Host</label>
          <select className="text-input" value={hostMode} onChange={(event) => handleHostModeChange(event.target.value as HostMode)}>
            <option value="localhost">localhost</option>
            <option value="%">{t.mysql.allHosts}</option>
            <option value="custom">{t.database.custom}</option>
          </select>
          {hostMode === 'custom' && (
            <input
              className="text-input"
              type="text"
              placeholder={t.mysql.hostPlaceholder}
              value={values.host}
              onChange={(event) => update('host', event.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
        <div className="form-group">
          <label className="form-label">{t.mysql.charsetInput}</label>
          <select className="text-input" value={values.charset} onChange={(event) => update('charset', event.target.value)}>
            <option value="utf8mb4">{t.mysql.utf8mb4}</option>
            <option value="utf8">UTF-8</option>
            <option value="latin1">Latin1</option>
            <option value="ascii">ASCII</option>
            <option value="ucs2">UCS-2</option>
            <option value="utf16">UTF-16</option>
            <option value="utf32">UTF-32</option>
          </select>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
    </Modal>
  )
}
