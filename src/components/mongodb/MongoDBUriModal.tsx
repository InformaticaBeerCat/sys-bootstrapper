import { useState } from 'react'
import type { MongoDBScript } from '../../../electron/shared/databases/mongodb'
import { IconCheck, IconCopy } from '../../icons'
import { Modal } from '../modals/Modal'
import { buildMongoDBUri, type MongoDBUriScheme } from './buildMongoDBUri'

interface MongoDBUriModalProps {
  script: MongoDBScript
  onClose: () => void
}

export function MongoDBUriModal({ script, onClose }: MongoDBUriModalProps) {
  const [scheme, setScheme] = useState<MongoDBUriScheme>('mongodb')
  const [hosts, setHosts] = useState('localhost:27017')
  const [replicaSet, setReplicaSet] = useState('')
  const [tls, setTls] = useState(false)
  const [retryWritesMajority, setRetryWritesMajority] = useState(false)
  const [copied, setCopied] = useState(false)

  const uri = buildMongoDBUri({
    userName: script.userName,
    userPassword: script.userPassword,
    authDb: script.authDb,
    dbName: script.dbName,
    hosts,
    scheme,
    replicaSet,
    tls,
    retryWritesMajority
  })

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(uri)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard access unavailable (permisos/plataforma) - el botón simplemente no hace nada
    }
  }

  return (
    <Modal
      title="MongoDB — Generar URI de conexión"
      onClose={onClose}
      footer={(requestClose) => (
        <button type="button" className="btn" onClick={() => requestClose()}>
          Cerrar
        </button>
      )}
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Esquema</label>
          <select className="text-input" value={scheme} onChange={(event) => setScheme(event.target.value as MongoDBUriScheme)}>
            <option value="mongodb">mongodb:// (estándar, admite varios hosts)</option>
            <option value="mongodb+srv">mongodb+srv:// (DNS seedlist, ej: Atlas)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{scheme === 'mongodb+srv' ? 'Host (sin puerto)' : 'Host(s):puerto'}</label>
          <input
            className="text-input"
            type="text"
            placeholder={scheme === 'mongodb+srv' ? 'cluster0.abcde.mongodb.net' : 'localhost:27017, host2:27017'}
            value={hosts}
            onChange={(event) => setHosts(event.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Replica set (opcional)</label>
        <input
          className="text-input"
          type="text"
          placeholder="Ej: rs0 — dejar vacío si no aplica (con mongodb+srv normalmente no hace falta)"
          value={replicaSet}
          onChange={(event) => setReplicaSet(event.target.value)}
        />
      </div>

      <label className="radio-row">
        <input type="checkbox" checked={tls} onChange={(event) => setTls(event.target.checked)} />
        Habilitar TLS (<code>tls=true</code>)
      </label>
      <label className="radio-row">
        <input
          type="checkbox"
          checked={retryWritesMajority}
          onChange={(event) => setRetryWritesMajority(event.target.checked)}
        />
        <code>retryWrites=true&amp;w=majority</code> — solo válido contra un replica set o cluster; falla contra un mongod
        standalone
      </label>

      <div className="form-group" style={{ marginTop: 12 }}>
        <label className="form-label">URI generada</label>
        <div className="field-row">
          <input
            className="text-input"
            type="text"
            readOnly
            value={uri}
            onFocus={(event) => event.target.select()}
          />
          <button type="button" className="btn btn-sm" onClick={handleCopy}>
            {copied ? <IconCheck /> : <IconCopy />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
