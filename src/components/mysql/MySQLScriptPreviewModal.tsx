import { useEffect, useState } from 'react'
import type { MySQLScript } from '../../../electron/shared/databases/mysql'
import { useToast } from '../../contexts/ToastContext'
import { ConfirmModal } from '../modals/ConfirmModal'
import { Modal } from '../modals/Modal'
import { generateMySQLScript } from './generateMySQLScript'

interface MySQLScriptPreviewModalProps {
  script: MySQLScript
  onClose: () => void
}

export function MySQLScriptPreviewModal({ script, onClose }: MySQLScriptPreviewModalProps) {
  const { showToast } = useToast()
  const content = generateMySQLScript(script)
  const dbName = script.dbName || 'mysql'

  const [filename, setFilename] = useState(`${dbName}.sql`)
  const [saveOption, setSaveOption] = useState<'default' | 'custom'>('default')
  const [defaultSaveDir, setDefaultSaveDir] = useState('')
  const [customPath, setCustomPath] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [pendingOverwritePath, setPendingOverwritePath] = useState<string | null>(null)

  useEffect(() => {
    window.sysBootstrapper.mysql.getDefaultSaveDir().then(setDefaultSaveDir)
  }, [])

  async function handleChooseCustomPath() {
    const selected = await window.sysBootstrapper.dialog.selectDirectory()
    if (selected) setCustomPath(selected)
  }

  async function doSave() {
    setSaving(true)
    try {
      const saveDir = saveOption === 'default' ? null : customPath
      const result = await window.sysBootstrapper.mysql.saveScriptFile({
        filename,
        content,
        saveDir,
        dbName: script.dbName
      })
      if (result.success) {
        showToast(`Archivo guardado en: ${result.filePath}`, 'success')
        onClose()
      } else {
        showToast(`Error al guardar archivo: ${result.error}`, 'danger')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveClick() {
    const saveDir = saveOption === 'default' ? null : customPath
    const exists = await window.sysBootstrapper.mysql.fileExists({ filename, saveDir, dbName: script.dbName })
    if (exists) {
      const baseDir = saveDir || defaultSaveDir
      setPendingOverwritePath(`${baseDir}/${dbName}/${filename}`)
      return
    }
    await doSave()
  }

  const disableSave = saving || !filename.trim() || (saveOption === 'custom' && !customPath)

  return (
    <>
      <Modal
        title="Vista previa del script SQL"
        onClose={onClose}
        size="lg"
        footer={(requestClose) => (
          <>
            <button type="button" className="btn" onClick={() => requestClose(onClose)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" disabled={disableSave} onClick={handleSaveClick}>
              Guardar
            </button>
          </>
        )}
      >
        <div className="form-group">
          <label className="form-label">¿Dónde guardar?</label>
          <label className="radio-row">
            <input type="radio" checked={saveOption === 'default'} onChange={() => setSaveOption('default')} />
            Guardar en <code>{defaultSaveDir}</code>
          </label>
          <label className="radio-row">
            <input type="radio" checked={saveOption === 'custom'} onChange={() => setSaveOption('custom')} />
            Elegir otro lugar
          </label>
        </div>

        {saveOption === 'custom' && (
          <div className="comp-row" style={{ marginBottom: 12 }}>
            <button type="button" className="btn btn-sm" onClick={handleChooseCustomPath}>
              Elegir carpeta destino...
            </button>
            <span className="text-xs text-muted">{customPath || 'No se ha seleccionado carpeta'}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Nombre del archivo</label>
          <input className="text-input" type="text" value={filename} onChange={(event) => setFilename(event.target.value)} />
        </div>

        <pre className="code-block">{content}</pre>
      </Modal>

      {pendingOverwritePath && (
        <ConfirmModal
          title="El archivo ya existe"
          message={`Ya existe un archivo en: ${pendingOverwritePath}. ¿Deseas sobreescribirlo?`}
          confirmLabel="Sobrescribir"
          onConfirm={() => {
            setPendingOverwritePath(null)
            void doSave()
          }}
          onCancel={() => setPendingOverwritePath(null)}
        />
      )}
    </>
  )
}
