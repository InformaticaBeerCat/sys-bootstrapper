import { useState } from 'react'
import type { MongoDBScript } from '../../../electron/shared/databases/mongodb'
import { useI18n } from '../../contexts/I18nContext'
import { IconCheck, IconCopy } from '../../icons'
import { Modal } from '../modals/Modal'
import { buildMongoDBUri, type MongoDBUriScheme } from './buildMongoDBUri'

interface MongoDBUriModalProps {
  script: MongoDBScript
  onClose: () => void
}

export function MongoDBUriModal({ script, onClose }: MongoDBUriModalProps) {
  const { t } = useI18n()
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
      title={t.mongodb.uri.title}
      onClose={onClose}
      footer={(requestClose) => (
        <button type="button" className="btn" onClick={() => requestClose()}>
          {t.common.close}
        </button>
      )}
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.mongodb.uri.scheme}</label>
          <select className="text-input" value={scheme} onChange={(event) => setScheme(event.target.value as MongoDBUriScheme)}>
            <option value="mongodb">{t.mongodb.uri.schemeStandard}</option>
            <option value="mongodb+srv">{t.mongodb.uri.schemeSrv}</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{scheme === 'mongodb+srv' ? t.mongodb.uri.hostSrv : t.mongodb.uri.hostsStandard}</label>
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
        <label className="form-label">{t.mongodb.uri.replicaSet}</label>
        <input
          className="text-input"
          type="text"
          placeholder={t.mongodb.uri.replicaSetPlaceholder}
          value={replicaSet}
          onChange={(event) => setReplicaSet(event.target.value)}
        />
      </div>

      <label className="radio-row">
        <input type="checkbox" checked={tls} onChange={(event) => setTls(event.target.checked)} />
        {t.mongodb.uri.enableTls}
      </label>
      <label className="radio-row">
        <input
          type="checkbox"
          checked={retryWritesMajority}
          onChange={(event) => setRetryWritesMajority(event.target.checked)}
        />
        {t.mongodb.uri.retryWrites}
      </label>

      <div className="form-group" style={{ marginTop: 12 }}>
        <label className="form-label">{t.mongodb.uri.generatedUri}</label>
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
            {copied ? t.common.copied : t.common.copy}
          </button>
        </div>
      </div>
    </Modal>
  )
}
