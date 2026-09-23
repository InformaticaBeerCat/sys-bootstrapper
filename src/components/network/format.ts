import { classifyIp } from '../../../electron/shared/network'
import type { Dictionary } from '../../i18n'

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

export function formatBytes(bytes: number, locale: string): string {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit++
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${BYTE_UNITS[unit]}`
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale)
}

export function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { dateStyle: 'medium' })
}

/** "CL" → "Chile" en el idioma de la interfaz. */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

const PLATFORM_NAMES: Record<string, string> = { darwin: 'macOS', win32: 'Windows', linux: 'Linux' }

export function platformName(platform: string): string {
  return PLATFORM_NAMES[platform] ?? platform
}

const KNOWN_DNS_PROVIDERS: Record<string, string> = {
  '1.1.1.1': 'Cloudflare',
  '1.0.0.1': 'Cloudflare',
  '2606:4700:4700::1111': 'Cloudflare',
  '2606:4700:4700::1001': 'Cloudflare',
  '8.8.8.8': 'Google',
  '8.8.4.4': 'Google',
  '2001:4860:4860::8888': 'Google',
  '2001:4860:4860::8844': 'Google',
  '9.9.9.9': 'Quad9',
  '149.112.112.112': 'Quad9',
  '2620:fe::fe': 'Quad9',
  '208.67.222.222': 'OpenDNS',
  '208.67.220.220': 'OpenDNS',
  '94.140.14.14': 'AdGuard',
  '94.140.15.15': 'AdGuard'
}

/** Etiqueta para un servidor DNS: proveedor público conocido, resolver local o de la LAN. */
export function dnsServerLabel(address: string, t: Dictionary): string | null {
  const known = KNOWN_DNS_PROVIDERS[address.toLowerCase()]
  if (known) return known
  const kind = classifyIp(address)
  if (kind === 'loopback') return t.networkView.dnsLocal
  if (kind === 'private' || kind === 'link-local') return t.networkView.dnsLan
  return null
}

/**
 * Traduce los códigos de error que manda el main (c-ares, sockets, TLS) a un texto legible,
 * dejando el código entre paréntesis para quien quiera buscarlo. Los EINVALID* son propios de la app.
 */
export function describeNetError(code: string, t: Dictionary): string {
  const message = (t.networkView.errors as Record<string, string>)[code]
  if (!message) return code
  return code.startsWith('EINVALID') ? message : `${message} (${code})`
}
