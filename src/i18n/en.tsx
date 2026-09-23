import type { ReactNode } from 'react'
import type { Dictionary } from './es'

export const en: Dictionary = {
  common: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    closeNotification: 'Close notification',
    save: 'Save',
    saveChanges: 'Save changes',
    create: 'Create',
    delete: 'Delete',
    view: 'View',
    edit: 'Edit',
    new: 'New',
    refresh: 'Refresh',
    copy: 'Copy',
    copied: 'Copied',
    show: 'Show',
    hide: 'Hide',
    yes: 'Yes',
    no: 'No',
    enabled: 'Enabled',
    actions: 'Actions',
    openDirectory: 'Open folder',
    generate: (target: string) => `Generate ${target}`,
    createdAt: (date: string) => `Created ${date}`,
    records: (count: number) => `${count} ${count === 1 ? 'record' : 'records'}`,
    deleteRecordMessage: (name: string) =>
      `This deletes the record and, if it exists, the folder generated on disk for "${name}". Continue?`
  },

  nav: {
    home: 'Home',
    httpServers: 'HTTP servers',
    databases: 'Databases',
    general: 'General',
    about: 'About',
    settings: 'Settings'
  },

  toolTaglines: {
    'http-apache': 'Robust, modular HTTP server with broad module support (mod_rewrite, mod_ssl, etc.).',
    'http-nginx': 'High-performance web server and reverse proxy, ideal for serving static content and load balancing.',
    'http-caddy': 'Modern web server with automatic HTTPS by default and minimal configuration (Caddyfile).',
    'db-mysql': 'Widely used relational engine for web applications, a classic part of the LAMP stack.',
    'db-postgresql': 'Advanced relational engine with extended support for types, JSON and indexes.',
    'db-mongodb': 'Document-oriented NoSQL database, flexible for evolving schemas.'
  },

  dashboard: {
    tagline: 'Your Swiss Army knife for configuring servers and databases, all in one place.',
    directoryReady: 'Directory configured',
    directoryMissing: 'No directory configured',
    slogan: 'If it works for me, it’ll probably work for you too… for some damn thing.',
    gettingStarted: 'Getting started',
    steps: [
      { title: 'Set up your directory', text: 'Choose where your generated configurations will be saved.' },
      { title: 'Pick a tool', text: 'HTTP server or database, whatever you need today.' },
      { title: 'Generate and copy', text: 'Fill in the form and copy the result into your project.' }
    ],
    summary: 'Overview',
    totalTools: 'Total tools',
    andCounting: 'And counting',
    workingDirectory: 'Working directory',
    ready: 'Ready',
    pending: 'Pending',
    setUpToStart: 'Set it up to get started',
    network: 'Network',
    quickAccess: 'Quick access'
  },

  network: {
    privateIp: 'Private IP (LAN)',
    publicIp: 'Public IP',
    searching: 'Looking up…',
    unavailable: 'Not available',
    interfaceName: (name: string) => `Interface: ${name}`,
    noInterfaces: 'No active network interfaces',
    publicIpHint: "If it changes often or doesn't match your router's, you may be behind CG-NAT or a VPN.",
    publicIpError: (detail: string | null) =>
      detail ? `Couldn't get the public IP (${detail})` : "Couldn't get the public IP",
    cgnatRange: 'CG-NAT range',
    possibleCgnat: 'Possible CG-NAT',
    unusualPrivateRange: 'Private range (unusual)'
  },

  settings: {
    description: 'Set the working directory where this app saves the files it generates, and the interface language.',
    workingDirectory: 'Working directory',
    workingDirectoryHint: 'Used as the default destination for generated files.',
    noFolderSelected: 'No folder selected',
    change: 'Change',
    chooseFolder: 'Choose folder',
    remove: 'Remove',
    directoryConfigured: (saved: boolean) => `Directory configured${saved ? ' and saved' : ''}.`,
    directoryMissing: 'No working directory has been chosen yet.',
    defaultDirectory: (path: ReactNode) => <>{path} will be used by default.</>,
    directoryUpdated: 'Working directory updated.',
    directorySaveError: "Couldn't save the working directory.",
    directoryRemoved: 'Working directory removed from the configuration.',
    directoryRemoveError: "Couldn't remove the working directory.",
    removeDirectoryTitle: 'Remove working directory',
    removeDirectoryMessage:
      'This only clears the reference stored in the configuration; the folder and its contents on disk are left untouched. Continue?',
    language: 'Language',
    languageHint: 'Applies to the interface and to comments in generated scripts.',
    languageSaveError: "Couldn't save the language.",
    configFile: 'Configuration file',
    configFileHint: "JSON record stored in a hidden data folder of the operating system.",
    path: 'Path:',
    lastUpdated: 'Last updated:',
    notSavedYet: '— (not saved yet)'
  },

  about: {
    description: "BeerCat's Swiss Army knife for sysadmins: frequently used configurations and utilities, all in one place.",
    stackHint: 'What the app is built with.',
    categories: 'Available categories',
    categoriesHint: 'More utilities and generators are on the way, by category.',
    engines: (count: number) => `${count} ${count === 1 ? 'engine' : 'engines'}`,
    internalUse: 'BeerCat internal use'
  },

  saveFile: {
    whereToSave: 'Where to save?',
    saveIn: 'Save to',
    chooseOtherLocation: 'Choose another location',
    chooseTargetFolder: 'Choose target folder...',
    noFolderSelected: 'No folder selected',
    filename: 'File name',
    saved: (path: string) => `File saved to: ${path}`,
    saveError: (error: string) => `Error saving file: ${error}`,
    existsTitle: 'File already exists',
    existsMessage: (path: string) => `A file already exists at: ${path}. Do you want to overwrite it?`,
    overwrite: 'Overwrite'
  },

  httpServer: {
    configurations: 'Configurations',
    empty: 'No configurations yet — use "New" to add the first one.',
    created: 'Configuration created successfully.',
    edited: 'Configuration updated successfully.',
    saveError: "Couldn't save the configuration.",
    deleted: 'Configuration deleted successfully.',
    deleteError: "Couldn't delete the configuration.",
    deleteTitle: 'Delete configuration',
    newTitle: (tool: string) => `New ${tool} configuration`,
    editTitle: (tool: string) => `Edit ${tool} configuration`,
    detailTitle: (tool: string) => `${tool} — Configuration details`,
    previewTitle: (file: string) => `${file} preview`,
    domains: 'Domains',
    domainsInput: 'Domains (comma-separated)',
    domainsPlaceholder: 'e.g. mydomain.com, www.otherdomain.com',
    enableHttp: 'Enable HTTP (80)',
    enableHttps: 'Enable HTTPS (443)',
    redirectToHttps: 'Redirect HTTP to HTTPS',
    pathPlaceholder: 'e.g. /var/www/html, /srv/mysite',
    proxyTargetInput: 'Proxy target (IP:PORT)',
    proxyTargetPlaceholder: 'e.g. 127.0.0.1:3000, api.mydomain.com:8080',
    sslCertificate: 'SSL certificate',
    sslModes: {
      certbot: "Certbot (Let's Encrypt)",
      snakeoil: 'Snakeoil (default)',
      custom: 'Custom'
    },
    certificate: 'Certificate',
    privateKey: 'Private key',
    certPathInput: 'Certificate path (.crt/.pem)',
    certPathPlaceholder: 'e.g. /etc/ssl/certs/mysite.pem',
    keyPathInput: 'Private key path (.key)',
    keyPathPlaceholder: 'e.g. /etc/ssl/private/mysite.key',
    validation: {
      domainRequired: 'Enter at least one domain.',
      domainFormat: 'All domains must have a valid format (e.g. mydomain.com).',
      protocolRequired: 'Enable HTTP (80), HTTPS (443) or both.',
      certRequired: 'Enter the certificate path and the private key path.'
    }
  },

  apache: {
    description: 'Apache VirtualHost configurations: domains, HTTP/HTTPS, SSL and reverse proxy.',
    useDocumentRoot: 'Use DocumentRoot',
    useReverseProxy: 'Use reverse proxy',
    pathInput: 'Site path (DocumentRoot)',
    proxyTarget: 'Proxy target',
    pathRequired: 'The site path is required.',
    proxyRequired: 'The proxy target is required.'
  },

  nginx: {
    description: 'Nginx server block configurations: domains, HTTP/HTTPS, SSL and reverse proxy.',
    domains: 'Domains / server_name',
    domainsInput: 'Domains / server_name (comma-separated)',
    serveStatic: 'Serve static files (root)',
    useReverseProxy: 'Use reverse proxy (proxy_pass)',
    pathInput: 'Site path (root)',
    pathRequired: 'The site path (root) is required.',
    proxyRequired: 'The proxy_pass target is required.'
  },

  caddy: {
    description: 'Caddy site configurations: domains, automatic HTTPS, reverse proxy and static files.',
    serveStatic: 'Serve static files (root * + file_server)',
    useReverseProxy: 'Use reverse proxy (reverse_proxy)',
    pathInput: 'Site path (root)',
    tlsOptions: {
      auto: "Automatic (Let's Encrypt, default)",
      internal: 'Internal (self-signed, for local domains)',
      custom: 'Custom',
      off: 'Disabled (HTTP only)'
    },
    tlsLabels: {
      auto: "Automatic (Let's Encrypt)",
      internal: 'Internal (self-signed)',
      custom: 'Custom',
      off: 'Disabled (HTTP only)'
    },
    tlsShort: {
      auto: 'Automatic',
      internal: 'Internal',
      custom: 'Custom',
      off: 'Disabled'
    },
    compressResponses: 'Compress responses (encode zstd gzip)',
    compression: 'Compression',
    compressionEncode: 'Compression (encode)',
    mode: 'Mode',
    modeProxy: 'Proxy',
    modeStatic: 'Static',
    pathRequired: 'The site path (root) is required.',
    proxyRequired: 'The reverse_proxy target is required.'
  },

  database: {
    empty: 'No scripts yet — use "New" to add the first one.',
    created: 'Script created successfully.',
    edited: 'Script updated successfully.',
    saveError: "Couldn't save the script.",
    deleted: 'Script deleted successfully.',
    deleteError: "Couldn't delete the script.",
    deleteTitle: 'Delete script',
    newTitle: (tool: string) => `New ${tool} script`,
    editTitle: (tool: string) => `Edit ${tool} script`,
    detailTitle: (tool: string) => `${tool} — Script details`,
    previewTitle: (kind: string) => `${kind} script preview`,
    database: 'Database',
    dbNameInput: 'Database name',
    dbNamePlaceholder: 'e.g. my_app_production',
    user: 'User',
    userPlaceholder: 'e.g. app_user, admin, reader',
    password: 'Password',
    passwordPlaceholder: 'Strong password for the user',
    generatePassword: 'Generate strong',
    privileges: 'Privileges',
    privilegesPreset: 'Privilege preset',
    privilegesPlaceholder: 'e.g. SELECT, INSERT, UPDATE, DELETE',
    encoding: 'Encoding',
    custom: 'custom',
    allRequired: 'All fields are required.',
    presets: {
      personalizado: 'custom',
      produccion: 'production',
      desarrollo: 'development',
      solo_lectura: 'read-only'
    }
  },

  mysql: {
    description: 'Scripts to create a database, user and privileges for MySQL.',
    allHosts: 'all hosts (%)',
    hostPlaceholder: 'e.g. 192.168.1.100, server.mydomain.com',
    charsetInput: 'Encoding (charset)',
    utf8mb4: 'UTF-8 multibyte (recommended)'
  },

  postgresql: {
    description: 'Scripts to create a database, role and privileges for PostgreSQL.',
    userRole: 'User (role)',
    presetOptions: {
      produccion: 'production (not owner)',
      desarrollo: 'development (owner, full control)'
    },
    tablePrivilegesInput: 'Table privileges',
    tablePrivileges: 'Privileges (tables)',
    allowedConnections: 'Allowed connections',
    allowedConnectionsInput: 'Allowed connections (pg_hba.conf)',
    hostLocal: 'localhost only (127.0.0.1/32)',
    hostAll: 'all IPs (0.0.0.0/0)',
    hostCustom: 'custom (CIDR)',
    hostPlaceholder: 'e.g. 192.168.1.0/24',
    encodingInput: 'Encoding',
    utf8: 'UTF8 (recommended)',
    psqlNote: (
      <>
        This script uses the psql <code>\gexec</code> idiom, so it must be run with{' '}
        <code>psql -U postgres -f file.sql</code> (it won't work pasted into a generic SQL client).
      </>
    ),
    script: {
      hbaHint: (user: string) => [
        `Suggested pg_hba.conf entry to allow "${user}" to connect`,
        '(edit pg_hba.conf and reload the config with: SELECT pg_reload_conf();)'
      ],
      openHbaWarning: ['Warning: this allows connections from any IP; use only in development.'],
      roleStep: ['1) Role (user). CREATE ROLE does not support IF NOT EXISTS, so it is checked manually.'],
      databaseStep: [
        '2) Database. CREATE DATABASE does not support IF NOT EXISTS either, and cannot run',
        '   inside DO blocks or transactions; this uses the psql \\gexec idiom',
        '   (run this file with: psql -U postgres -f file.sql).'
      ],
      privilegesStep: [
        '3) Privileges. Reconnects to the database so the GRANTs on the "public" schema',
        '   apply there and not to the current database of the session.'
      ],
      defaultPrivileges: [
        'Applies the same privileges to tables/sequences created later.',
        'Note: this only covers objects created by the role running this script; if',
        'another role creates the tables (e.g. a migrations role), add "FOR ROLE <role>".'
      ]
    }
  },

  mongodb: {
    description: 'mongosh scripts to create a database, user and roles in MongoDB.',
    rolePreset: 'Role preset',
    presetOptions: {
      produccion: 'production (readWrite)',
      desarrollo: 'development (dbOwner, full control)',
      solo_lectura: 'read-only (read)'
    },
    rolesInput: 'Roles (on this database)',
    rolesPlaceholder: 'e.g. readWrite  or  read, dbAdmin',
    authDb: 'Authentication database',
    authDbInput: 'Authentication database (authSource)',
    authDbSame: (dbName: string) => `same database (${dbName})`,
    authDbAdmin: 'admin (administrative user)',
    authDbPlaceholder: 'e.g. admin, other_db',
    bindIpInput: 'Listening IP(s) (bindIp)',
    bindIpLocal: 'localhost only (127.0.0.1)',
    bindIpAll: 'all interfaces (0.0.0.0)',
    bindIpPlaceholder: 'e.g. 10.0.0.5,10.0.0.6 (specific IPs, not CIDR)',
    createInitialCollection: (
      <>
        Create initial collection "_init" (Mongo doesn't list empty databases in <code>show dbs</code>)
      </>
    ),
    initialCollection: 'Initial collection',
    adminSessionNote: (
      <>
        This script runs in a session already authenticated with admin privileges, for example:{' '}
        <code>mongosh "mongodb://admin:pass@localhost:27017/admin" --file file.js</code>.
      </>
    ),
    uri: {
      title: 'MongoDB — Generate connection URI',
      scheme: 'Scheme',
      schemeStandard: 'mongodb:// (standard, supports multiple hosts)',
      schemeSrv: 'mongodb+srv:// (DNS seedlist, e.g. Atlas)',
      hostSrv: 'Host (no port)',
      hostsStandard: 'Host(s):port',
      replicaSet: 'Replica set (optional)',
      replicaSetPlaceholder: 'e.g. rs0 — leave empty if not applicable (usually not needed with mongodb+srv)',
      enableTls: (
        <>
          Enable TLS (<code>tls=true</code>)
        </>
      ),
      retryWrites: (
        <>
          <code>retryWrites=true&amp;w=majority</code> — only valid against a replica set or cluster; fails against a
          standalone mongod
        </>
      ),
      generatedUri: 'Generated URI'
    },
    script: {
      confHint: [
        'Suggested mongod.conf settings to expose the service only where needed',
        '(edit mongod.conf and restart the service: sudo systemctl restart mongod)'
      ],
      bindIpNote: [
        'Note: bindIp only accepts specific IPs/hostnames (no CIDR ranges); to',
        'restrict by range, use the system firewall (ufw/iptables/security group).'
      ],
      openBindIpWarning: [
        'Warning: 0.0.0.0 exposes MongoDB to any IP. Without authentication enabled',
        'and without a firewall, the instance is reachable from the internet.'
      ],
      authorizationNote: [
        'Without "security.authorization: enabled" in mongod.conf, the user created here',
        'restricts nothing: anyone can connect without authenticating.'
      ],
      runAsAdmin: [
        'Run while already authenticated as an admin user (userAdmin/root), for example:',
        '  mongosh "mongodb://admin:pass@localhost:27017/admin" --file file.js'
      ],
      createUserNote: ['createUser has no "if not exists" option; it is checked manually with getUser().'],
      userExistsPrint: `'User "' + userName + '" already exists in "' + authDb.getName() + '"; skipping creation.'`,
      userCreatedPrint: `'User "' + userName + '" created in "' + authDb.getName() + '".'`,
      initialCollectionNote: [
        'Mongo does not persist an empty database: it only shows up in "show dbs" once it has',
        'at least one collection. This placeholder forces it to be created.'
      ],
      initialCollectionPrint: `'Collection "_init" created to initialize "' + dbName + '".'`,
      suggestedUri: [
        'Suggested connection string for the application (adjust host:port for your deployment;',
        'use "Generate URI" to build variants with replica set, mongodb+srv or TLS):'
      ]
    }
  }
}
