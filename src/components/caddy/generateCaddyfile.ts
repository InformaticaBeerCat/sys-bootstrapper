import type { CaddyServerInput } from '../../../electron/shared/http-servers/caddy'

/**
 * A diferencia de Apache/Nginx, Caddy no necesita bloques separados por puerto:
 * un único bloque de sitio alcanza porque Caddy gestiona TLS automáticamente
 * (Let's Encrypt) y no exige orden manual de directivas.
 */
export function generateCaddyfile(config: CaddyServerInput): string {
  const domains = config.domains
    .split(',')
    .map((domain) => domain.trim())
    .filter(Boolean)
  const scheme = config.tls === 'off' ? 'http://' : ''
  const address = (domains.length > 0 ? domains : ['localhost']).map((domain) => `${scheme}${domain}`).join(' ')
  const docRoot = config.path || '/var/www/html'

  const lines: string[] = []

  if (config.tls === 'internal') {
    lines.push('tls internal')
  } else if (config.tls === 'custom') {
    lines.push(`tls ${config.tlsCustomCert || ''} ${config.tlsCustomKey || ''}`.trimEnd())
  }

  if (config.encodeGzip) {
    lines.push('encode zstd gzip')
  }

  if (config.mode === 'proxy') {
    lines.push(`reverse_proxy ${config.proxyTarget}`)
  } else {
    lines.push(`root * ${docRoot}`)
    lines.push('file_server')
  }

  const body = lines.map((line) => `    ${line}`).join('\n')

  return `${address} {\n${body}\n}`
}
