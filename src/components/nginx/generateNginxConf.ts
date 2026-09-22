import type { NginxServerInput } from '../../../electron/shared/http-servers/nginx'

export function generateNginxConf(config: NginxServerInput): string {
  const domains = config.domains
    .split(',')
    .map((domain) => domain.trim())
    .filter(Boolean)
  const serverName = domains.join(' ') || 'localhost'
  const docRoot = config.path || '/var/www/html'
  const proxy = config.isProxy
  const proxyTarget = config.proxyTarget

  const locationBlock = proxy
    ? `    location / {
        proxy_pass http://${proxyTarget}/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }`
    : `    location / {
        try_files $uri $uri/ =404;
    }`

  const rootLines = proxy ? '' : `    root ${docRoot};
    index index.html index.htm;

`

  let conf = ''

  if (config.http) {
    if (config.redirect && config.https) {
      conf += `server {
    listen 80;
    listen [::]:80;
    server_name ${serverName};

    return 301 https://$host$request_uri;
}

`
    } else {
      conf += `server {
    listen 80;
    listen [::]:80;
    server_name ${serverName};

${rootLines}${locationBlock}
}

`
    }
  }

  if (config.https) {
    let sslCert = ''
    let sslKey = ''
    if (config.ssl === 'certbot') {
      sslCert = `/etc/letsencrypt/live/${domains[0] || 'localhost'}/fullchain.pem`
      sslKey = `/etc/letsencrypt/live/${domains[0] || 'localhost'}/privkey.pem`
    } else if (config.ssl === 'snakeoil') {
      sslCert = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
      sslKey = '/etc/ssl/private/ssl-cert-snakeoil.key'
    } else if (config.ssl === 'custom') {
      sslCert = config.sslCustomCert || ''
      sslKey = config.sslCustomKey || ''
    }
    conf += `server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${serverName};

    ssl_certificate ${sslCert};
    ssl_certificate_key ${sslKey};

${rootLines}${locationBlock}
}
`
  }

  return conf.trim()
}
