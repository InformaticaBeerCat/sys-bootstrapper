import type { MongoDBScriptInput } from '../../../electron/shared/databases/mongodb'
import type { Dictionary } from '../../i18n'
import { buildMongoDBUri } from './buildMongoDBUri'

function parseRoles(roles: string): string[] {
  return roles
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean)
}

function formatRolesArray(roles: string[], dbName: string): string {
  const entries = roles.map((role) => `{ role: ${JSON.stringify(role)}, db: ${JSON.stringify(dbName)} }`)
  return `[${entries.join(', ')}]`
}

/** Una línea de comentario JS por elemento; los elementos vacíos quedan como "//" a secas. */
function comment(lines: string[], indent = ''): string {
  return lines.map((line) => (line ? `${indent}// ${line}\n` : `${indent}//\n`)).join('')
}

export function generateMongoDBScript(config: MongoDBScriptInput, text: Dictionary['mongodb']['script']): string {
  const dbName = config.dbName
  const userName = config.userName
  const authDb = config.authDb || dbName
  const bindIp = config.bindIp || '127.0.0.1'
  const roles = parseRoles(config.roles)
  const rolesLiteral = formatRolesArray(roles.length > 0 ? roles : ['read'], dbName)

  let js = comment(text.confHint)
  js += comment([
    '',
    'net:',
    `  bindIp: 127.0.0.1${bindIp !== '127.0.0.1' ? `,${bindIp}` : ''}`,
    '  port: 27017',
    'security:',
    '  authorization: enabled',
    '',
    ...text.bindIpNote
  ])
  if (bindIp === '0.0.0.0') {
    js += comment(['', ...text.openBindIpWarning])
  }
  js += comment(['', ...text.authorizationNote])
  js += `\n`

  js += comment(text.runAsAdmin)
  js += `\n`

  js += `(function () {\n`
  js += `  const dbName = ${JSON.stringify(dbName)};\n`
  js += `  const userName = ${JSON.stringify(userName)};\n`
  js += `  const authDb = db.getSiblingDB(${JSON.stringify(authDb)});\n`
  js += `  const targetDb = db.getSiblingDB(dbName);\n\n`

  js += comment(text.createUserNote, '  ')
  js += `  const existingUser = authDb.getUser(userName);\n`
  js += `  if (existingUser !== null) {\n`
  js += `    print(${text.userExistsPrint});\n`
  js += `  } else {\n`
  js += `    authDb.createUser({\n`
  js += `      user: userName,\n`
  js += `      pwd: ${JSON.stringify(config.userPassword)},\n`
  js += `      roles: ${rolesLiteral}\n`
  js += `    });\n`
  js += `    print(${text.userCreatedPrint});\n`
  js += `  }\n`

  if (config.createInitialCollection) {
    js += `\n`
    js += comment(text.initialCollectionNote, '  ')
    js += `  if (!targetDb.getCollectionNames().includes('_init')) {\n`
    js += `    targetDb.createCollection('_init');\n`
    js += `    print(${text.initialCollectionPrint});\n`
    js += `  }\n`
  }

  js += `})();\n\n`

  const suggestedUri = buildMongoDBUri({
    userName,
    userPassword: config.userPassword,
    authDb,
    dbName,
    hosts: 'localhost:27017',
    scheme: 'mongodb'
  })
  js += comment([...text.suggestedUri, suggestedUri])

  return js
}
