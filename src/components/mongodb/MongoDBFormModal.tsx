import { useEffect, useState } from 'react'
import type { MongoDBRolePreset, MongoDBScriptInput } from '../../../electron/shared/databases/mongodb'
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
      ? 'Todos los campos son obligatorios.'
      : null

  return (
    <Modal
      title={mode === 'create' ? 'Nuevo script MongoDB' : 'Editar script MongoDB'}
      onClose={onCancel}
      size="lg"
      footer={(requestClose) => (
        <>
          <button type="button" className="btn" onClick={() => requestClose(onCancel)}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!!error}
            onClick={() => requestClose(() => onSave(values))}
          >
            {mode === 'create' ? 'Crear' : 'Guardar cambios'}
          </button>
        </>
      )}
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Nombre de la base de datos</label>
          <input
            className="text-input"
            type="text"
            placeholder="ej: mi_programa_produccion"
            value={values.dbName}
            onChange={(event) => update('dbName', event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Usuario</label>
          <input
            className="text-input"
            type="text"
            placeholder="ej: usuario_app, admin, lector"
            value={values.userName}
            onChange={(event) => update('userName', event.target.value)}
          />
        </div>
      </div>

      <div className="form-row form-row-1">
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <div className="field-row">
            <input
              className="text-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña segura para el usuario"
              value={values.userPassword}
              onChange={(event) => update('userPassword', event.target.value)}
            />
            <button type="button" className="btn btn-sm" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => update('userPassword', generateMongoDBPassword(20))}
            >
              Generar segura
            </button>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Preset de rol</label>
          <select
            className="text-input"
            value={values.preset}
            onChange={(event) => update('preset', event.target.value as MongoDBRolePreset)}
          >
            <option value="personalizado">personalizado</option>
            <option value="produccion">producción (readWrite)</option>
            <option value="desarrollo">desarrollo (dbOwner, control total)</option>
            <option value="solo_lectura">solo_lectura (read)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Roles (sobre esta base)</label>
          <input
            className="text-input"
            type="text"
            placeholder="Ej: readWrite  ó  read, dbAdmin"
            value={values.roles}
            onChange={(event) => update('roles', event.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Base de autenticación (authSource)</label>
          <select
            className="text-input"
            value={authDbMode}
            onChange={(event) => setAuthDbMode(event.target.value as AuthDbMode)}
          >
            <option value="mismo">la misma base ({values.dbName || 'dbName'})</option>
            <option value="admin">admin (usuario administrativo)</option>
            <option value="custom">personalizado</option>
          </select>
          {authDbMode === 'custom' && (
            <input
              className="text-input"
              type="text"
              placeholder="Ej: admin, otra_base"
              value={values.authDb}
              onChange={(event) => update('authDb', event.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
        <div className="form-group">
          <label className="form-label">IP(s) de escucha (bindIp)</label>
          <select
            className="text-input"
            value={bindIpMode}
            onChange={(event) => handleBindIpModeChange(event.target.value as BindIpMode)}
          >
            <option value="local">solo localhost (127.0.0.1)</option>
            <option value="todas">todas las interfaces (0.0.0.0)</option>
            <option value="custom">personalizado</option>
          </select>
          {bindIpMode === 'custom' && (
            <input
              className="text-input"
              type="text"
              placeholder="Ej: 10.0.0.5,10.0.0.6 (IPs puntuales, no CIDR)"
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
        Crear colección inicial "_init" (Mongo no muestra bases vacías en <code>show dbs</code>)
      </label>

      {error && <p className="form-error">{error}</p>}
    </Modal>
  )
}
