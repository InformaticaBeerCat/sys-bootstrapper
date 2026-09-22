import type { ComponentType } from 'react'
import {
  SiApache,
  SiApacheHex,
  SiCaddy,
  SiCaddyHex,
  SiMariadb,
  SiMariadbHex,
  SiMongodb,
  SiMongodbHex,
  SiMysql,
  SiMysqlHex,
  SiNginx,
  SiNginxHex,
  SiPostgresql,
  SiPostgresqlHex,
  SiRedis,
  SiRedisHex,
  SiSqlite,
  SiSqliteHex
} from '@icons-pack/react-simple-icons'

export type ToolCategory = 'http' | 'database'

export interface ToolField {
  label: string
  placeholder: string
  type?: 'text' | 'password' | 'number'
}

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
  fields: ToolField[]
}

export const HTTP_SERVERS: ToolConfig[] = [
  {
    id: 'http-apache',
    name: 'Apache',
    tagline: 'Servidor HTTP robusto y modular, con amplio soporte de módulos (mod_rewrite, mod_ssl, etc.).',
    category: 'http',
    Logo: SiApache,
    brandColor: SiApacheHex,
    fields: [
      { label: 'ServerName (VirtualHost)', placeholder: 'midominio.cl' },
      { label: 'Puerto de escucha', placeholder: '80', type: 'number' },
      { label: 'DocumentRoot', placeholder: '/var/www/midominio' },
      { label: 'ErrorLog', placeholder: '/var/log/apache2/midominio-error.log' }
    ]
  },
  {
    id: 'http-nginx',
    name: 'Nginx',
    tagline: 'Servidor web y proxy inverso de alto rendimiento, ideal para servir contenido estático y balancear carga.',
    category: 'http',
    Logo: SiNginx,
    brandColor: SiNginxHex,
    fields: [
      { label: 'server_name', placeholder: 'midominio.cl' },
      { label: 'Puerto de escucha', placeholder: '80', type: 'number' },
      { label: 'root', placeholder: '/var/www/midominio' },
      { label: 'proxy_pass', placeholder: 'http://127.0.0.1:3000' }
    ]
  },
  {
    id: 'http-caddy',
    name: 'Caddy',
    tagline: 'Servidor web moderno con HTTPS automático por defecto y configuración minimalista (Caddyfile).',
    category: 'http',
    Logo: SiCaddy,
    brandColor: SiCaddyHex,
    fields: [
      { label: 'Dominio', placeholder: 'midominio.cl' },
      { label: 'Puerto interno', placeholder: '8080', type: 'number' },
      { label: 'root * (raíz del sitio)', placeholder: '/var/www/midominio' },
      { label: 'reverse_proxy', placeholder: 'localhost:3000' }
    ]
  }
]

export const DATABASES: ToolConfig[] = [
  {
    id: 'db-mysql',
    name: 'MySQL',
    tagline: 'Motor relacional ampliamente usado en aplicaciones web, parte clásica del stack LAMP.',
    category: 'database',
    Logo: SiMysql,
    brandColor: SiMysqlHex,
    fields: [
      { label: 'Host', placeholder: '127.0.0.1' },
      { label: 'Puerto', placeholder: '3306', type: 'number' },
      { label: 'Base de datos', placeholder: 'app_db' },
      { label: 'Usuario', placeholder: 'app_user' },
      { label: 'Contraseña', placeholder: '••••••••', type: 'password' }
    ]
  },
  {
    id: 'db-postgresql',
    name: 'PostgreSQL',
    tagline: 'Motor relacional avanzado, con soporte extendido de tipos, JSON e índices.',
    category: 'database',
    Logo: SiPostgresql,
    brandColor: SiPostgresqlHex,
    fields: [
      { label: 'Host', placeholder: '127.0.0.1' },
      { label: 'Puerto', placeholder: '5432', type: 'number' },
      { label: 'Base de datos', placeholder: 'app_db' },
      { label: 'Usuario', placeholder: 'app_user' },
      { label: 'Contraseña', placeholder: '••••••••', type: 'password' }
    ]
  },
  {
    id: 'db-mongodb',
    name: 'MongoDB',
    tagline: 'Base de datos NoSQL orientada a documentos, flexible para esquemas cambiantes.',
    category: 'database',
    Logo: SiMongodb,
    brandColor: SiMongodbHex,
    fields: [
      { label: 'URI de conexión', placeholder: 'mongodb://127.0.0.1:27017' },
      { label: 'Base de datos', placeholder: 'app_db' },
      { label: 'Usuario', placeholder: 'app_user' },
      { label: 'Contraseña', placeholder: '••••••••', type: 'password' }
    ]
  },
  {
    id: 'db-redis',
    name: 'Redis',
    tagline: 'Almacén en memoria clave-valor, usado como caché, cola o broker de mensajes.',
    category: 'database',
    Logo: SiRedis,
    brandColor: SiRedisHex,
    fields: [
      { label: 'Host', placeholder: '127.0.0.1' },
      { label: 'Puerto', placeholder: '6379', type: 'number' },
      { label: 'Contraseña', placeholder: '••••••••', type: 'password' },
      { label: 'Base (índice 0-15)', placeholder: '0', type: 'number' }
    ]
  },
  {
    id: 'db-sqlite',
    name: 'SQLite',
    tagline: 'Motor embebido basado en un solo archivo, sin proceso de servidor.',
    category: 'database',
    Logo: SiSqlite,
    brandColor: SiSqliteHex,
    fields: [{ label: 'Ruta del archivo', placeholder: '/data/app.db' }]
  },
  {
    id: 'db-mariadb',
    name: 'MariaDB',
    tagline: 'Fork de MySQL compatible con el mismo protocolo, con mejoras de rendimiento y motores extra.',
    category: 'database',
    Logo: SiMariadb,
    brandColor: SiMariadbHex,
    fields: [
      { label: 'Host', placeholder: '127.0.0.1' },
      { label: 'Puerto', placeholder: '3306', type: 'number' },
      { label: 'Base de datos', placeholder: 'app_db' },
      { label: 'Usuario', placeholder: 'app_user' },
      { label: 'Contraseña', placeholder: '••••••••', type: 'password' }
    ]
  }
]

export const ALL_TOOLS: ToolConfig[] = [...HTTP_SERVERS, ...DATABASES]

export function findTool(id: string): ToolConfig | undefined {
  return ALL_TOOLS.find((tool) => tool.id === id)
}

export interface ToolRecord {
  id: string
  createdAt: number
  values: Record<string, string>
}

export function emptyRecordValues(tool: ToolConfig): Record<string, string> {
  return Object.fromEntries(tool.fields.map((field) => [field.label, '']))
}

export function createSeedRecord(tool: ToolConfig): ToolRecord {
  return {
    id: `seed-${tool.id}`,
    createdAt: Date.now(),
    values: Object.fromEntries(tool.fields.map((field) => [field.label, field.placeholder]))
  }
}
