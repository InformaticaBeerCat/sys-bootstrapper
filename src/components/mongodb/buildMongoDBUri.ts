export type MongoDBUriScheme = 'mongodb' | 'mongodb+srv'

export interface MongoDBUriOptions {
  userName: string
  userPassword: string
  authDb: string
  dbName: string
  hosts: string
  scheme: MongoDBUriScheme
  replicaSet?: string
  tls?: boolean
  retryWritesMajority?: boolean
}

/**
 * Con "mongodb+srv" el driver resuelve host/puerto (y a veces otras opciones)
 * vía DNS, así que "hosts" debe ser un único hostname sin puerto (ej: Atlas).
 * Con "mongodb" (esquema estándar) puede ser una lista separada por comas de
 * "host:puerto" para apuntar a los miembros de un replica set.
 */
export function buildMongoDBUri(options: MongoDBUriOptions): string {
  const user = encodeURIComponent(options.userName)
  const pass = encodeURIComponent(options.userPassword)
  const hosts = options.hosts.trim() || 'localhost:27017'

  const params = new URLSearchParams()
  params.set('authSource', options.authDb || options.dbName)
  if (options.replicaSet?.trim()) params.set('replicaSet', options.replicaSet.trim())
  if (options.tls) params.set('tls', 'true')
  if (options.retryWritesMajority) {
    params.set('retryWrites', 'true')
    params.set('w', 'majority')
  }

  return `${options.scheme}://${user}:${pass}@${hosts}/${options.dbName}?${params.toString()}`
}
