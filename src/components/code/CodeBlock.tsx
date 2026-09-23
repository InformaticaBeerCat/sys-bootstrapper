import { useState } from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import apacheconf from 'react-syntax-highlighter/dist/esm/languages/prism/apacheconf'
import mongodb from 'react-syntax-highlighter/dist/esm/languages/prism/mongodb'
import nginx from 'react-syntax-highlighter/dist/esm/languages/prism/nginx'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import caddyfile from './languages/caddyfile'
import { IconCheck, IconCopy } from '../../icons'

/**
 * Cada vista de código nueva (PostgreSQL, etc.) importa y registra su propio
 * lenguaje Prism acá con una línea — mismo criterio de "una línea por tool"
 * que IPC_CHANNELS en shared/ipcChannels.ts. `caddyfile` no viene con Prism,
 * así que se define a mano en `./languages/caddyfile`.
 */
SyntaxHighlighter.registerLanguage('apacheconf', apacheconf)
SyntaxHighlighter.registerLanguage('nginx', nginx)
SyntaxHighlighter.registerLanguage('caddyfile', caddyfile)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('mongodb', mongodb)

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard access unavailable (permissions/platform) - button silently no-ops
    }
  }

  return (
    <div className="code-block">
      <button type="button" className="code-copy-btn" onClick={handleCopy}>
        {copied ? <IconCheck /> : <IconCopy />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '14px',
          background: 'transparent',
          fontSize: '11.5px',
          lineHeight: 1.5
        }}
        codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
