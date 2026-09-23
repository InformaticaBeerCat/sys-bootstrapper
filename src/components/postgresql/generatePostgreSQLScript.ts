import type { PostgreSQLPrivilegePreset, PostgreSQLScriptInput } from '../../../electron/shared/databases/postgresql'

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

export function generatePostgreSQLScript(config: PostgreSQLScriptInput): string {
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

  let sql = `-- Sugerencia de pg_hba.conf para permitir la conexion de "${user}"\n`
  sql += `-- (edita pg_hba.conf y recarga la config con: SELECT pg_reload_conf();)\n`
  sql += `--\n`
  sql += `-- host    ${db}    ${user}    ${allowedHost}    scram-sha-256\n`
  if (allowedHost === '0.0.0.0/0') {
    sql += `--\n-- Atencion: esto permite conexiones desde cualquier IP; usar solo en desarrollo.\n`
  }
  sql += `\n`

  sql += `-- 1) Rol (usuario). CREATE ROLE no admite IF NOT EXISTS, se valida a mano.\n`
  sql += `DO\n$$\nBEGIN\n`
  sql += `  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${escapeSqlString(config.userName)}') THEN\n`
  sql += `    CREATE ROLE "${user}" WITH LOGIN PASSWORD '${pass}';\n`
  sql += `  END IF;\n`
  sql += `END\n$$;\n\n`

  sql += `-- 2) Base de datos. CREATE DATABASE tampoco admite IF NOT EXISTS ni corre dentro\n`
  sql += `--    de bloques DO ni transacciones; se usa el modismo \\gexec de psql\n`
  sql += `--    (ejecutar este archivo con: psql -U postgres -f archivo.sql).\n`
  sql += `SELECT 'CREATE DATABASE "${db}"${ownerClause} ENCODING ''${encoding}'''\n`
  sql += `WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${escapeSqlString(config.dbName)}')\\gexec\n\n`

  sql += `-- 3) Privilegios. Se reconecta a la base para que los GRANT sobre el esquema\n`
  sql += `--    "public" apliquen ahi y no en la base actual de la sesion.\n`
  sql += `\\connect "${db}"\n\n`
  sql += `GRANT ${databasePrivileges} ON DATABASE "${db}" TO "${user}";\n`
  sql += `GRANT ${schemaPrivileges} ON SCHEMA public TO "${user}";\n`
  sql += `GRANT ${tablePrivileges} ON ALL TABLES IN SCHEMA public TO "${user}";\n`
  sql += `GRANT ${sequencePrivileges} ON ALL SEQUENCES IN SCHEMA public TO "${user}";\n\n`

  sql += `-- Aplica los mismos privilegios a las tablas/secuencias que se creen despues.\n`
  sql += `-- Nota: sólo cubre objetos creados por el rol que ejecuta este script; si las\n`
  sql += `-- tablas las crea otro rol (p.ej. uno de migraciones), agrega "FOR ROLE <rol>".\n`
  sql += `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ${tablePrivileges} ON TABLES TO "${user}";\n`
  sql += `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ${sequencePrivileges} ON SEQUENCES TO "${user}";\n`

  return sql
}
