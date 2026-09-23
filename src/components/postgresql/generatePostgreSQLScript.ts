import type { PostgreSQLPrivilegePreset, PostgreSQLScriptInput } from '../../../electron/shared/databases/postgresql'
import type { Dictionary } from '../../i18n'

/**
 * A diferencia de MySQL, en Postgres el owner de la base tiene control total sobre
 * ella por diseño. Por eso "desarrollo" (conveniencia, control total) sí asigna
 * OWNER y privilegios amplios, mientras que "produccion"/"solo_lectura"/"personalizado"
 * dejan la base con su owner de bootstrap (quien corre el script) y sólo otorgan al
 * usuario de la app los privilegios explícitos de este preset (mínimo privilegio).
 */
const DATABASE_PRIVILEGES: Record<PostgreSQLPrivilegePreset, string> = {
  personalizado: 'CONNECT',
  produccion: 'CONNECT',
  desarrollo: 'ALL PRIVILEGES',
  solo_lectura: 'CONNECT'
}

const SCHEMA_PRIVILEGES: Record<PostgreSQLPrivilegePreset, string> = {
  personalizado: 'USAGE',
  produccion: 'USAGE',
  desarrollo: 'USAGE, CREATE',
  solo_lectura: 'USAGE'
}

// Las secuencias sólo aceptan SELECT, UPDATE, USAGE (o ALL); no INSERT/DELETE,
// así que se derivan aparte y no se copian tal cual desde "privileges" (tablas).
const SEQUENCE_PRIVILEGES: Record<PostgreSQLPrivilegePreset, string> = {
  personalizado: 'USAGE, SELECT',
  produccion: 'USAGE, SELECT',
  desarrollo: 'ALL PRIVILEGES',
  solo_lectura: 'SELECT'
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''")
}

function escapeIdentifier(value: string): string {
  return value.replace(/"/g, '""')
}

/** Una línea de comentario SQL por elemento; los elementos vacíos quedan como "--" a secas. */
function comment(lines: string[]): string {
  return lines.map((line) => (line ? `-- ${line}\n` : '--\n')).join('')
}

export function generatePostgreSQLScript(
  config: PostgreSQLScriptInput,
  text: Dictionary['postgresql']['script']
): string {
  const db = escapeIdentifier(config.dbName)
  const user = escapeIdentifier(config.userName)
  const pass = escapeSqlString(config.userPassword)
  const tablePrivileges = config.privileges
  const encoding = config.encoding || 'UTF8'
  const allowedHost = config.allowedHost || '127.0.0.1/32'

  const databasePrivileges = DATABASE_PRIVILEGES[config.preset] ?? 'CONNECT'
  const schemaPrivileges = SCHEMA_PRIVILEGES[config.preset] ?? 'USAGE'
  const sequencePrivileges = SEQUENCE_PRIVILEGES[config.preset] ?? 'USAGE, SELECT'
  const ownerClause = config.preset === 'desarrollo' ? ` OWNER "${user}"` : ''

  let sql = comment(text.hbaHint(user))
  sql += comment(['', `host    ${db}    ${user}    ${allowedHost}    scram-sha-256`])
  if (allowedHost === '0.0.0.0/0') {
    sql += comment(['', ...text.openHbaWarning])
  }
  sql += `\n`

  sql += comment(text.roleStep)
  sql += `DO\n$$\nBEGIN\n`
  sql += `  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${escapeSqlString(config.userName)}') THEN\n`
  sql += `    CREATE ROLE "${user}" WITH LOGIN PASSWORD '${pass}';\n`
  sql += `  END IF;\n`
  sql += `END\n$$;\n\n`

  sql += comment(text.databaseStep)
  sql += `SELECT 'CREATE DATABASE "${db}"${ownerClause} ENCODING ''${encoding}'''\n`
  sql += `WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${escapeSqlString(config.dbName)}')\\gexec\n\n`

  sql += comment(text.privilegesStep)
  sql += `\\connect "${db}"\n\n`
  sql += `GRANT ${databasePrivileges} ON DATABASE "${db}" TO "${user}";\n`
  sql += `GRANT ${schemaPrivileges} ON SCHEMA public TO "${user}";\n`
  sql += `GRANT ${tablePrivileges} ON ALL TABLES IN SCHEMA public TO "${user}";\n`
  sql += `GRANT ${sequencePrivileges} ON ALL SEQUENCES IN SCHEMA public TO "${user}";\n\n`

  sql += comment(text.defaultPrivileges)
  sql += `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ${tablePrivileges} ON TABLES TO "${user}";\n`
  sql += `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ${sequencePrivileges} ON SEQUENCES TO "${user}";\n`

  return sql
}
