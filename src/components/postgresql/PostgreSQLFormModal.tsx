import { useEffect, useState } from 'react'
import type { PostgreSQLPrivilegePreset, PostgreSQLScriptInput } from '../../../electron/shared/databases/postgresql'
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
      ? 'Todos los campos son obligatorios.'
      : null

  return (
    <Modal
      title={mode === 'create' ? 'Nuevo script PostgreSQL' : 'Editar script PostgreSQL'}
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
          <label className="form-label">Usuario (rol)</label>
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
              onClick={() => update('userPassword', generatePostgreSQLPassword(20))}
            >
              Generar segura
            </button>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Preset de privilegios</label>
          <select
            className="text-input"
            value={values.preset}
            onChange={(event) => update('preset', event.target.value as PostgreSQLPrivilegePreset)}
          >
            <option value="personalizado">personalizado</option>
            <option value="produccion">producción (sin ser owner)</option>
            <option value="desarrollo">desarrollo (owner, control total)</option>
            <option value="solo_lectura">solo_lectura</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Privilegios sobre tablas</label>
          <input
            className="text-input"
            type="text"
            placeholder="Ej: SELECT, INSERT, UPDATE, DELETE"
            value={values.privileges}
            onChange={(event) => update('privileges', event.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Conexiones permitidas (pg_hba.conf)</label>
          <select className="text-input" value={hostMode} onChange={(event) => handleHostModeChange(event.target.value as HostMode)}>
            <option value="local">solo localhost (127.0.0.1/32)</option>
            <option value="todas">todas las IPs (0.0.0.0/0)</option>
            <option value="custom">personalizado (CIDR)</option>
          </select>
          {hostMode === 'custom' && (
            <input
              className="text-input"
              type="text"
              placeholder="Ej: 192.168.1.0/24"
              value={values.allowedHost}
              onChange={(event) => update('allowedHost', event.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Codificación (encoding)</label>
          <select className="text-input" value={values.encoding} onChange={(event) => update('encoding', event.target.value)}>
            <option value="UTF8">UTF8 (recomendado)</option>
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
