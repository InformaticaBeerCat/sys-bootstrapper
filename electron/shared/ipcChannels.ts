import { MONGODB_CHANNELS } from './databases/mongodb'
import { MYSQL_CHANNELS } from './databases/mysql'
import { POSTGRESQL_CHANNELS } from './databases/postgresql'
import { APACHE_CHANNELS } from './http-servers/apache'
import { CADDY_CHANNELS } from './http-servers/caddy'
import { NGINX_CHANNELS } from './http-servers/nginx'

/**
 * Punto único de agregación de canales IPC. Los dominios de app (config, dialog)
 * viven acá directo; cada tool (http-servers/<tool>, databases/<tool>, etc.) define
 * su propio bloque de canales junto a sus tipos en `shared/<categoría>/<tool>.ts`
 * y se suma en este objeto con una línea, para no mezclar todo en un solo archivo.
 */
export const IPC_CHANNELS = {
  config: {
    get: 'config:get',
    getPath: 'config:get-path',
    getDefaultWorkingDirectory: 'config:get-default-working-directory',
    setWorkingDirectory: 'config:set-working-directory',
    setLanguage: 'config:set-language'
  },
  dialog: {
    selectDirectory: 'dialog:select-directory'
  },
  network: {
    getPrivateIp: 'network:get-private-ip',
    getPublicIp: 'network:get-public-ip'
  },
  apache: APACHE_CHANNELS,
  nginx: NGINX_CHANNELS,
  caddy: CADDY_CHANNELS,
  mysql: MYSQL_CHANNELS,
  postgresql: POSTGRESQL_CHANNELS,
  mongodb: MONGODB_CHANNELS
} as const
