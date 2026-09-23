import type { ComponentType } from 'react'
import {
  SiApache,
  SiApacheHex,
  SiCaddy,
  SiCaddyHex,
  SiMongodb,
  SiMongodbHex,
  SiMysql,
  SiMysqlHex,
  SiNginx,
  SiNginxHex,
  SiPostgresql,
  SiPostgresqlHex
} from '@icons-pack/react-simple-icons'

export type ToolCategory = 'http' | 'database'

export interface LogoProps {
  size?: string | number
  color?: string
  title?: string
  className?: string
}

export interface ToolConfig {
  id: string
  name: string
  category: ToolCategory
  Logo: ComponentType<LogoProps>
  brandColor: string
}

export const HTTP_SERVERS: ToolConfig[] = [
  {
    id: 'http-apache',
    name: 'Apache',
    category: 'http',
    Logo: SiApache,
    brandColor: SiApacheHex
  },
  {
    id: 'http-nginx',
    name: 'Nginx',
    category: 'http',
    Logo: SiNginx,
    brandColor: SiNginxHex
  },
  {
    id: 'http-caddy',
    name: 'Caddy',
    category: 'http',
    Logo: SiCaddy,
    brandColor: SiCaddyHex
  }
]

export const DATABASES: ToolConfig[] = [
  {
    id: 'db-mysql',
    name: 'MySQL',
    category: 'database',
    Logo: SiMysql,
    brandColor: SiMysqlHex
  },
  {
    id: 'db-postgresql',
    name: 'PostgreSQL',
    category: 'database',
    Logo: SiPostgresql,
    brandColor: SiPostgresqlHex
  },
  {
    id: 'db-mongodb',
    name: 'MongoDB',
    category: 'database',
    Logo: SiMongodb,
    brandColor: SiMongodbHex
  }
]

export const ALL_TOOLS: ToolConfig[] = [...HTTP_SERVERS, ...DATABASES]
