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
  tagline: string
  category: ToolCategory
  Logo: ComponentType<LogoProps>
  brandColor: string
}

export const HTTP_SERVERS: ToolConfig[] = [
  {
    id: 'http-apache',
    name: 'Apache',
    tagline: 'Servidor HTTP robusto y modular, con amplio soporte de módulos (mod_rewrite, mod_ssl, etc.).',
    category: 'http',
    Logo: SiApache,
    brandColor: SiApacheHex
  },
  {
    id: 'http-nginx',
    name: 'Nginx',
    tagline: 'Servidor web y proxy inverso de alto rendimiento, ideal para servir contenido estático y balancear carga.',
    category: 'http',
    Logo: SiNginx,
    brandColor: SiNginxHex
  },
  {
    id: 'http-caddy',
    name: 'Caddy',
    tagline: 'Servidor web moderno con HTTPS automático por defecto y configuración minimalista (Caddyfile).',
    category: 'http',
    Logo: SiCaddy,
    brandColor: SiCaddyHex
  }
]

export const DATABASES: ToolConfig[] = [
  {
    id: 'db-mysql',
    name: 'MySQL',
    tagline: 'Motor relacional ampliamente usado en aplicaciones web, parte clásica del stack LAMP.',
    category: 'database',
    Logo: SiMysql,
    brandColor: SiMysqlHex
  },
  {
    id: 'db-postgresql',
    name: 'PostgreSQL',
    tagline: 'Motor relacional avanzado, con soporte extendido de tipos, JSON e índices.',
    category: 'database',
    Logo: SiPostgresql,
    brandColor: SiPostgresqlHex
  },
  {
    id: 'db-mongodb',
    name: 'MongoDB',
    tagline: 'Base de datos NoSQL orientada a documentos, flexible para esquemas cambiantes.',
    category: 'database',
    Logo: SiMongodb,
    brandColor: SiMongodbHex
  }
]

export const ALL_TOOLS: ToolConfig[] = [...HTTP_SERVERS, ...DATABASES]
