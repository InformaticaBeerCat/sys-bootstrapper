import type { MongoDBScriptInput } from '../../../electron/shared/databases/mongodb'

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

export function generateMongoDBScript(config: MongoDBScriptInput): string {
  const dbName = config.dbName
  const userName = config.userName
  const authDb = config.authDb || dbName
  const bindIp = config.bindIp || '127.0.0.1'
  const roles = parseRoles(config.roles)
  const rolesLiteral = formatRolesArray(roles.length > 0 ? roles : ['read'], dbName)

  let js = `// Sugerencia de mongod.conf para exponer el servicio solo donde corresponde\n`
  js += `// (edita mongod.conf y reinicia el servicio: sudo systemctl restart mongod)\n`
  js += `//\n`
  js += `// net:\n`
  js += `//   bindIp: 127.0.0.1${bindIp !== '127.0.0.1' ? `,${bindIp}` : ''}\n`
  js += `//   port: 27017\n`
  js += `// security:\n`
  js += `//   authorization: enabled\n`
  js += `//\n`
  js += `// Nota: bindIp solo acepta IPs/hostnames puntuales (no rangos CIDR); para\n`
  js += `// restringir por rango usa el firewall del sistema (ufw/iptables/security group).\n`
  if (bindIp === '0.0.0.0') {
    js += `//\n// Atencion: 0.0.0.0 expone MongoDB a cualquier IP. Sin autenticacion habilitada\n`
    js += `// y sin firewall, la instancia queda accesible desde internet.\n`
  }
  js += `//\n`
  js += `// Sin "security.authorization: enabled" en mongod.conf, el usuario creado acá\n`
  js += `// no restringe nada: cualquiera puede conectarse sin autenticarse.\n\n`

  js += `// Ejecutar ya autenticado con un usuario admin (userAdmin/root), por ejemplo:\n`
  js += `//   mongosh "mongodb://admin:pass@localhost:27017/admin" --file archivo.js\n\n`

  js += `(function () {\n`
  js += `  const dbName = ${JSON.stringify(dbName)};\n`
  js += `  const userName = ${JSON.stringify(userName)};\n`
  js += `  const authDb = db.getSiblingDB(${JSON.stringify(authDb)});\n`
  js += `  const targetDb = db.getSiblingDB(dbName);\n\n`

  js += `  // createUser no admite "si no existe"; se valida a mano con getUser().\n`
  js += `  const existingUser = authDb.getUser(userName);\n`
  js += `  if (existingUser !== null) {\n`
  js += `    print('El usuario "' + userName + '" ya existe en "' + authDb.getName() + '"; no se vuelve a crear.');\n`
  js += `  } else {\n`
  js += `    authDb.createUser({\n`
  js += `      user: userName,\n`
  js += `      pwd: ${JSON.stringify(config.userPassword)},\n`
  js += `      roles: ${rolesLiteral}\n`
  js += `    });\n`
  js += `    print('Usuario "' + userName + '" creado en "' + authDb.getName() + '".');\n`
  js += `  }\n`

  if (config.createInitialCollection) {
    js += `\n  // Mongo no persiste una base vacía: recién aparece en "show dbs" cuando tiene\n`
    js += `  // al menos una colección. Este placeholder fuerza su creación.\n`
    js += `  if (!targetDb.getCollectionNames().includes('_init')) {\n`
    js += `    targetDb.createCollection('_init');\n`
    js += `    print('Colección "_init" creada para inicializar "' + dbName + '".');\n`
    js += `  }\n`
  }

  js += `})();\n\n`

  js += `// Cadena de conexión sugerida para la aplicación (ajusta host:puerto según el despliegue):\n`
  js += `// mongodb://${encodeURIComponent(userName)}:<password>@localhost:27017/${dbName}?authSource=${authDb}\n`

  return js
}
