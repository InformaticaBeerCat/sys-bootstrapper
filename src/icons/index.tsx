import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
}

export function IconDashboard(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.2" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.2" />
      <rect x="13" y="10" width="7.5" height="10.5" rx="1.2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.2" />
    </svg>
  )
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.4M12 18.1v2.4M20.5 12h-2.4M5.9 12H3.5M17.7 6.3l-1.7 1.7M8 16l-1.7 1.7M17.7 17.7L16 16M8 8 6.3 6.3" />
    </svg>
  )
}

export function IconFolder(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 6.2c0-.7.6-1.3 1.3-1.3h4.4l1.7 2h8.3c.7 0 1.3.6 1.3 1.3v9.5c0 .7-.6 1.3-1.3 1.3H4.8c-.7 0-1.3-.6-1.3-1.3z" />
    </svg>
  )
}

export function IconFolderOpen(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 8.5V6.2c0-.7.6-1.3 1.3-1.3h4.4l1.7 2h6.8c.7 0 1.3.6 1.3 1.3v.3" />
      <path d="M3.5 8.5h16.3c.8 0 1.4.8 1.2 1.6l-1.7 7.3c-.2.7-.8 1.2-1.5 1.2H5.5c-.7 0-1.3-.5-1.5-1.2L2.3 10c-.2-.8.4-1.5 1.2-1.5z" />
    </svg>
  )
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.3 12.3l2.4 2.4 5-5.2" />
    </svg>
  )
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.8 21 19.5H3z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.6" r="0.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconServer(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4" width="17" height="6.5" rx="1.2" />
      <rect x="3.5" y="13.5" width="17" height="6.5" rx="1.2" />
      <path d="M7 7.2h.01M7 16.7h.01" strokeWidth="2.2" />
    </svg>
  )
}

export function IconInfo(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.2" />
      <circle cx="12" cy="8" r="0.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconXCircle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.3 9.3l5.4 5.4M14.7 9.3l-5.4 5.4" />
    </svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 7h15M9.5 7V5.2c0-.6.5-1.1 1.1-1.1h2.8c.6 0 1.1.5 1.1 1.1V7" />
      <path d="M6.5 7l.8 12.1c.05.7.6 1.2 1.3 1.2h6.8c.7 0 1.25-.5 1.3-1.2L17.5 7" />
      <path d="M10.3 11v6M13.7 11v6" />
    </svg>
  )
}
