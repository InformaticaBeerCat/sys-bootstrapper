import { useEffect, useState } from 'react'
import type { MySQLPrivilegePreset, MySQLScriptInput } from '../../../electron/shared/databases/mysql'
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
    ? 'Todos los campos son obligatorios.'
    : null

  return (
    <Modal
      title={mode === 'create' ? 'Nuevo script MySQL' : 'Editar script MySQL'}
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
              onClick={() => update('userPassword', generateMySQLPassword(20))}
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
            onChange={(event) => update('preset', event.target.value as MySQLPrivilegePreset)}
          >
            <option value="personalizado">personalizado</option>
            <option value="produccion">producción</option>
            <option value="desarrollo">desarrollo</option>
            <option value="solo_lectura">solo_lectura</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Privilegios</label>
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
          <label className="form-label">Host</label>
          <select className="text-input" value={hostMode} onChange={(event) => handleHostModeChange(event.target.value as HostMode)}>
            <option value="localhost">localhost</option>
            <option value="%">todos los hosts (%)</option>
            <option value="custom">personalizado</option>
          </select>
          {hostMode === 'custom' && (
            <input
              className="text-input"
              type="text"
              placeholder="Ej: 192.168.1.100, servidor.midominio.com"
              value={values.host}
              onChange={(event) => update('host', event.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Codificación (charset)</label>
          <select className="text-input" value={values.charset} onChange={(event) => update('charset', event.target.value)}>
            <option value="utf8mb4">UTF-8 multibyte (recomendado)</option>
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
