import { useEffect, useState } from 'react'
import type { MongoDBRolePreset, MongoDBScriptInput } from '../../../electron/shared/databases/mongodb'
import { useI18n } from '../../contexts/I18nContext'
import { Modal } from '../modals/Modal'
import { generateMongoDBPassword } from './generateMongoDBPassword'

const PRESET_ROLES: Record<string, string> = {
  produccion: 'readWrite',
  desarrollo: 'dbOwner',
  solo_lectura: 'read'
}

type AuthDbMode = 'mismo' | 'admin' | 'custom'
type BindIpMode = 'local' | 'todas' | 'custom'

function detectAuthDbMode(authDb: string, dbName: string): AuthDbMode {
  if (authDb === 'admin') return 'admin'
  if (authDb === dbName) return 'mismo'
  return 'custom'
}

function detectBindIpMode(bindIp: string): BindIpMode {
  if (bindIp === '127.0.0.1') return 'local'
  if (bindIp === '0.0.0.0') return 'todas'
  return 'custom'
}

const EMPTY_VALUES: MongoDBScriptInput = {
  dbName: '',
  userName: '',
  userPassword: '',
  preset: 'personalizado',
  roles: '',
  authDb: '',
  bindIp: '127.0.0.1',
  createInitialCollection: true
}

interface MongoDBFormModalProps {
  mode: 'create' | 'edit'
  initialValues?: MongoDBScriptInput
  onCancel: () => void
  onSave: (values: MongoDBScriptInput) => void
}

export function MongoDBFormModal({ mode, initialValues, onCancel, onSave }: MongoDBFormModalProps) {
  const { t } = useI18n()
  const initial = initialValues ?? EMPTY_VALUES
  const [values, setValues] = useState<MongoDBScriptInput>(initial)
  const [authDbMode, setAuthDbMode] = useState<AuthDbMode>(detectAuthDbMode(initial.authDb, initial.dbName))
  const [bindIpMode, setBindIpMode] = useState<BindIpMode>(detectBindIpMode(initial.bindIp))
  const [showPassword, setShowPassword] = useState(false)

  function update<K extends keyof MongoDBScriptInput>(key: K, value: MongoDBScriptInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    if (values.preset !== 'personalizado') {
      update('roles', PRESET_ROLES[values.preset] ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.preset])

  useEffect(() => {
    if (authDbMode === 'mismo') update('authDb', values.dbName)
    else if (authDbMode === 'admin') update('authDb', 'admin')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authDbMode, values.dbName])

  function handleBindIpModeChange(mode: BindIpMode) {
    setBindIpMode(mode)
    if (mode === 'local') update('bindIp', '127.0.0.1')
    else if (mode === 'todas') update('bindIp', '0.0.0.0')
    else update('bindIp', '')
  }

  const error =
    !values.dbName.trim() ||
    !values.userName.trim() ||
    !values.userPassword.trim() ||
    !values.roles.trim() ||
    !values.authDb.trim() ||
    !values.bindIp.trim()
      ? t.database.allRequired
      : null

  return (
    <Modal
      title={mode === 'create' ? t.database.newTitle('MongoDB') : t.database.editTitle('MongoDB')}
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
              onClick={() => update('userPassword', generateMongoDBPassword(20))}
            >
              {t.database.generatePassword}
            </button>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.mongodb.rolePreset}</label>
          <select
            className="text-input"
            value={values.preset}
            onChange={(event) => update('preset', event.target.value as MongoDBRolePreset)}
          >
            <option value="personalizado">{t.database.presets.personalizado}</option>
            <option value="produccion">{t.mongodb.presetOptions.produccion}</option>
            <option value="desarrollo">{t.mongodb.presetOptions.desarrollo}</option>
            <option value="solo_lectura">{t.mongodb.presetOptions.solo_lectura}</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t.mongodb.rolesInput}</label>
          <input
            className="text-input"
            type="text"
            placeholder={t.mongodb.rolesPlaceholder}
            value={values.roles}
            onChange={(event) => update('roles', event.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.mongodb.authDbInput}</label>
          <select
            className="text-input"
            value={authDbMode}
            onChange={(event) => setAuthDbMode(event.target.value as AuthDbMode)}
          >
            <option value="mismo">{t.mongodb.authDbSame(values.dbName || 'dbName')}</option>
            <option value="admin">{t.mongodb.authDbAdmin}</option>
            <option value="custom">{t.database.custom}</option>
          </select>
          {authDbMode === 'custom' && (
            <input
              className="text-input"
              type="text"
              placeholder={t.mongodb.authDbPlaceholder}
              value={values.authDb}
              onChange={(event) => update('authDb', event.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
        <div className="form-group">
          <label className="form-label">{t.mongodb.bindIpInput}</label>
          <select
            className="text-input"
            value={bindIpMode}
            onChange={(event) => handleBindIpModeChange(event.target.value as BindIpMode)}
          >
            <option value="local">{t.mongodb.bindIpLocal}</option>
            <option value="todas">{t.mongodb.bindIpAll}</option>
            <option value="custom">{t.database.custom}</option>
          </select>
          {bindIpMode === 'custom' && (
            <input
              className="text-input"
              type="text"
              placeholder={t.mongodb.bindIpPlaceholder}
              value={values.bindIp}
              onChange={(event) => update('bindIp', event.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      </div>

      <label className="radio-row">
        <input
          type="checkbox"
          checked={values.createInitialCollection}
          onChange={(event) => update('createInitialCollection', event.target.checked)}
        />
        {t.mongodb.createInitialCollection}
      </label>

      {error && <p className="form-error">{error}</p>}
    </Modal>
  )
}
