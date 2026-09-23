import { useEffect, useState } from 'react'
import type { NginxServer } from '../../../electron/shared/http-servers/nginx'
import { useI18n } from '../../contexts/I18nContext'
import { useToast } from '../../contexts/ToastContext'
import { CodeBlock } from '../code/CodeBlock'
import { ConfirmModal } from '../modals/ConfirmModal'
import { Modal } from '../modals/Modal'
import { generateNginxConf } from './generateNginxConf'

interface NginxConfPreviewModalProps {
  server: NginxServer
  onClose: () => void
}

export function NginxConfPreviewModal({ server, onClose }: NginxConfPreviewModalProps) {
  const { showToast } = useToast()
  const { t } = useI18n()
  const content = generateNginxConf(server)
  const firstDomain = server.domains.split(',')[0]?.trim() || 'nginx'

  const [filename, setFilename] = useState(`${firstDomain}.conf`)
  const [saveOption, setSaveOption] = useState<'default' | 'custom'>('default')
  const [defaultSaveDir, setDefaultSaveDir] = useState('')
  const [customPath, setCustomPath] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [pendingOverwritePath, setPendingOverwritePath] = useState<string | null>(null)

  useEffect(() => {
    window.sysBootstrapper.nginx.getDefaultSaveDir().then(setDefaultSaveDir)
  }, [])

  async function handleChooseCustomPath() {
    const selected = await window.sysBootstrapper.dialog.selectDirectory()
    if (selected) setCustomPath(selected)
  }

  async function doSave() {
    setSaving(true)
    try {
      const saveDir = saveOption === 'default' ? null : customPath
      const result = await window.sysBootstrapper.nginx.saveConfFile({
        filename,
        content,
        saveDir,
        domains: server.domains
      })
      if (result.success) {
        showToast(t.saveFile.saved(result.filePath ?? ''), 'success')
        onClose()
      } else {
        showToast(t.saveFile.saveError(result.error ?? ''), 'danger')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveClick() {
    const saveDir = saveOption === 'default' ? null : customPath
    const exists = await window.sysBootstrapper.nginx.fileExists({ filename, saveDir, domains: server.domains })
    if (exists) {
      const baseDir = saveDir || defaultSaveDir
      setPendingOverwritePath(`${baseDir}/${firstDomain}/${filename}`)
      return
    }
    await doSave()
  }

  const disableSave = saving || !filename.trim() || (saveOption === 'custom' && !customPath)

  return (
    <>
      <Modal
        title={t.httpServer.previewTitle('.conf')}
        onClose={onClose}
        size="lg"
        footer={(requestClose) => (
          <>
            <button type="button" className="btn" onClick={() => requestClose(onClose)}>
              {t.common.cancel}
            </button>
            <button type="button" className="btn btn-primary" disabled={disableSave} onClick={handleSaveClick}>
              {t.common.save}
            </button>
          </>
        )}
      >
        <div className="form-group">
          <label className="form-label">{t.saveFile.whereToSave}</label>
          <label className="radio-row">
            <input type="radio" checked={saveOption === 'default'} onChange={() => setSaveOption('default')} />
            {t.saveFile.saveIn} <code>{defaultSaveDir}</code>
          </label>
          <label className="radio-row">
            <input type="radio" checked={saveOption === 'custom'} onChange={() => setSaveOption('custom')} />
            {t.saveFile.chooseOtherLocation}
          </label>
        </div>

        {saveOption === 'custom' && (
          <div className="comp-row" style={{ marginBottom: 12 }}>
            <button type="button" className="btn btn-sm" onClick={handleChooseCustomPath}>
              {t.saveFile.chooseTargetFolder}
            </button>
            <span className="text-xs text-muted">{customPath || t.saveFile.noFolderSelected}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">{t.saveFile.filename}</label>
          <input className="text-input" type="text" value={filename} onChange={(event) => setFilename(event.target.value)} />
        </div>

        <CodeBlock code={content} language="nginx" />
      </Modal>

      {pendingOverwritePath && (
        <ConfirmModal
          title={t.saveFile.existsTitle}
          message={t.saveFile.existsMessage(pendingOverwritePath)}
          confirmLabel={t.saveFile.overwrite}
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
