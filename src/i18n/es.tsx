import type { ReactNode } from 'react'

/**
 * Diccionario base de la app. Es la fuente de verdad: `Dictionary` se deriva de este objeto,
 * así que una clave nueva acá obliga a agregarla en los demás idiomas (el compilador avisa).
 * Los textos con partes dinámicas son funciones y los que llevan formato (<code>) son JSX.
 */
export const es = {
  common: {
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    closeNotification: 'Cerrar notificación',
    save: 'Guardar',
    saveChanges: 'Guardar cambios',
    create: 'Crear',
    delete: 'Eliminar',
    view: 'Ver',
    edit: 'Editar',
    new: 'Nueva',
    refresh: 'Actualizar',
    copy: 'Copiar',
    copied: 'Copiado',
    show: 'Mostrar',
    hide: 'Ocultar',
    yes: 'Sí',
    no: 'No',
    enabled: 'Habilitado',
    actions: 'Acciones',
    openDirectory: 'Abrir directorio',
    generate: (target: string) => `Generar ${target}`,
    createdAt: (date: string) => `Creado ${date}`,
    records: (count: number) => `${count} ${count === 1 ? 'registro' : 'registros'}`,
    deleteRecordMessage: (name: string) =>
      `Esto elimina el registro y, si existe, la carpeta generada en disco para "${name}". ¿Continuar?`
  },

  nav: {
    home: 'Inicio',
    httpServers: 'Servidores HTTP',
    databases: 'Bases de datos',
    system: 'Sistema',
    network: 'Red',
    general: 'General',
    about: 'Acerca de',
    settings: 'Configuración'
  },

  /** Descripción corta de cada herramienta, indexada por el `id` de `data/tools.ts`. */
  toolTaglines: {
    'http-apache': 'Servidor HTTP robusto y modular, con amplio soporte de módulos (mod_rewrite, mod_ssl, etc.).',
    'http-nginx':
      'Servidor web y proxy inverso de alto rendimiento, ideal para servir contenido estático y balancear carga.',
    'http-caddy': 'Servidor web moderno con HTTPS automático por defecto y configuración minimalista (Caddyfile).',
    'db-mysql': 'Motor relacional ampliamente usado en aplicaciones web, parte clásica del stack LAMP.',
    'db-postgresql': 'Motor relacional avanzado, con soporte extendido de tipos, JSON e índices.',
    'db-mongodb': 'Base de datos NoSQL orientada a documentos, flexible para esquemas cambiantes.'
  },

  dashboard: {
    tagline: 'Tu navaja suiza para configurar servidores y bases de datos, todo desde un mismo lugar.',
    directoryReady: 'Directorio configurado',
    directoryMissing: 'Sin directorio configurado',
    slogan: 'Si a mí me sirve, probablemente a ti también te sirva… en alguna weá.',
    gettingStarted: 'Primeros pasos',
    steps: [
      { title: 'Configura tu directorio', text: 'Elige dónde se van a guardar tus configuraciones generadas.' },
      { title: 'Elige una herramienta', text: 'Servidor HTTP o base de datos, lo que necesites hoy.' },
      { title: 'Genera y copia', text: 'Completa el formulario y copia el resultado a tu proyecto.' }
    ],
    summary: 'Resumen',
    totalTools: 'Herramientas totales',
    andCounting: 'Y sumando',
    workingDirectory: 'Directorio de trabajo',
    ready: 'Listo',
    pending: 'Pendiente',
    setUpToStart: 'Configúralo para empezar',
    network: 'Red',
    openNetwork: 'Ver módulo de red',
    quickAccess: 'Accesos rápidos'
  },

  network: {
    privateIp: 'IP privada (LAN)',
    publicIp: 'IP pública',
    searching: 'Buscando…',
    unavailable: 'No disponible',
    interfaceName: (name: string) => `Interfaz: ${name}`,
    noInterfaces: 'Sin interfaces de red activas',
    publicIpHint: 'Si cambia seguido o no coincide con la de tu router, puede que estés detrás de un CG-NAT o VPN.',
    publicIpError: (detail: string | null) =>
      detail ? `No se pudo obtener la IP pública (${detail})` : 'No se pudo obtener la IP pública',
    cgnatRange: 'Rango CG-NAT',
    possibleCgnat: 'Posible CG-NAT',
    unusualPrivateRange: 'Rango privado (inusual)'
  },

  networkView: {
    description:
      'Todo lo que el equipo sabe de su red: interfaces, rutas, vecinos, puertos en escucha, DNS, proxy e Internet, más herramientas de diagnóstico.',
    tabs: {
      overview: 'Resumen',
      interfaces: 'Interfaces',
      routes: 'Rutas y vecinos',
      ports: 'Puertos',
      diagnostics: 'Diagnóstico'
    },
    collectedAt: (time: string) => `Datos tomados a las ${time}`,
    loading: 'Recolectando datos de red…',
    copyReport: 'Copiar JSON',
    exportReport: 'Exportar JSON',
    reportHint: 'Informe completo en JSON (interfaces, rutas, vecinos, puertos, DNS, proxy e IP pública), listo para procesar.',
    reportCopied: 'Informe de red copiado al portapapeles.',
    reportSaved: (path: string) => `Informe guardado en: ${path}`,
    reportError: 'No se pudo generar el informe de red.',
    loadError: (detail: string) => `No se pudo leer: ${detail}`,

    machine: 'Equipo',
    connection: 'Conexión',
    online: 'En línea',
    offline: 'Sin conexión',
    connectionEstimate: (type: string, downlink: number, rtt: number) =>
      `Chromium estima ${type.toUpperCase()} · ~${downlink} Mbps · ${rtt} ms`,
    gateway: 'Puerta de enlace',
    noGateway: 'Sin gateway',
    viaInterface: (name: string) => `Vía ${name}`,
    primaryInterface: 'Interfaz principal',
    findingsTitle: 'Hallazgos',
    findingsHint: 'Diagnóstico automático a partir de los datos recolectados.',
    findings: {
      allGood: 'No se detectaron problemas de red.',
      offline: 'El sistema reporta que no hay conexión de red.',
      noGateway: 'No hay puerta de enlace por defecto: el equipo no tiene ruta hacia Internet.',
      apipa: (iface: string, ip: string) => `${iface} tiene una IP autoasignada (${ip}): el servidor DHCP no respondió.`,
      noDns: 'No hay servidores DNS configurados: no se podrán resolver nombres.',
      noPublicIp: 'No se pudo obtener la IP pública: no hay salida a Internet o el tráfico está bloqueado.',
      cgnat:
        'La IP pública está en el rango CG-NAT (100.64.0.0/10): no se pueden abrir puertos hacia este equipo desde Internet.',
      publicPrivate: 'La IP "pública" está en un rango privado: hay un proxy, una VPN o doble NAT de por medio.',
      vpn: (names: string) => `Túnel o VPN activo: ${names}.`,
      proxy: (rule: string) => `El tráfico web sale por proxy: ${rule}.`,
      macHidden:
        'macOS oculta las MAC y la caché ARP a esta app. Para verlas, activa su permiso en Ajustes del Sistema → Privacidad y seguridad → Red local.',
      ipv6: 'Hay conectividad IPv6 pública.',
      noIpv6: 'Sin conectividad IPv6 pública (solo IPv4).'
    },
    internet: 'Conexión a Internet',
    internetHint: 'Consulta servicios externos: ipify / icanhazip para la IP e ipinfo.io / ipwho.is para ISP y ubicación.',
    publicIpv4: 'IPv4 pública',
    publicIpv6: 'IPv6 pública',
    noIpv6: 'Sin IPv6 pública',
    reverseDns: 'DNS inverso (PTR)',
    isp: 'Proveedor (ISP)',
    asn: 'Sistema autónomo',
    location: 'Ubicación aprox.',
    timezone: 'Zona horaria',
    geoSource: (source: string) => `ISP y ubicación según ${source}.`,
    geoError: (detail: string) => `No se pudo obtener ISP ni ubicación (${detail}).`,
    dnsAndProxy: 'DNS y proxy',
    dnsAndProxyHint: 'Resolvers que usa el sistema y proxy que aplica Chromium (incluye PAC/WPAD).',
    dnsServers: 'Servidores DNS',
    dnsLocal: 'Local',
    dnsLan: 'LAN / router',
    proxy: 'Proxy',
    proxyDirect: 'Directo, sin proxy',

    showAllInterfaces: 'Mostrar loopback, virtuales y túneles sin IP',
    interfacesShown: (shown: number, total: number) => `${shown} de ${total} interfaces`,
    kinds: {
      ethernet: 'Ethernet',
      wifi: 'Wi-Fi',
      vpn: 'VPN / túnel',
      virtual: 'Virtual',
      loopback: 'Loopback',
      other: 'Otra'
    },
    primary: 'Principal',
    privateMac: 'Privada / aleatoria',
    macHidden: 'Oculta por macOS (permiso de Red local)',
    hardwareMac: 'MAC de fábrica',
    traffic: 'Tráfico',
    subnetSummary: (network: string, broadcast: string, hosts: string) =>
      `Red ${network} · Broadcast ${broadcast} · ${hosts} hosts`,
    ipKinds: {
      private: 'Privada',
      cgnat: 'CG-NAT',
      public: 'Pública',
      loopback: 'Loopback',
      'link-local': 'Link-local',
      unknown: '—'
    },

    routingTable: 'Tabla de rutas (IPv4)',
    routingHint: 'Por dónde sale el tráfico según el destino.',
    destination: 'Destino',
    gatewayColumn: 'Gateway',
    interface: 'Interfaz',
    metric: 'Métrica',
    flags: 'Flags',
    onLink: 'Directo (on-link)',
    defaultRoute: 'Por defecto',
    noRoutes: 'No se encontraron rutas.',
    neighbors: 'Vecinos en la LAN (caché ARP)',
    neighborsHint: 'Equipos con los que este host se comunicó hace poco en la red local.',
    ipAddress: 'Dirección IP',
    type: 'Tipo',
    neighborStates: { static: 'Estática', dynamic: 'Dinámica' },
    router: 'Router',
    noNeighbors: 'La caché ARP está vacía.',
    arpRestricted:
      'macOS está ocultando la caché ARP a esta app. Actívala en Ajustes del Sistema → Privacidad y seguridad → Red local y actualiza.',

    listeningPorts: 'Puertos en escucha',
    listeningHint: 'Servicios de este equipo esperando conexiones. "Todas las interfaces" = alcanzable desde la red.',
    partialNotice:
      'Sin privilegios de administrador pueden faltar puertos o procesos de otros usuarios (root, servicios del sistema).',
    filterPlaceholder: 'Filtrar por puerto, proceso o servicio',
    allProtocols: 'Todos',
    onlyExposed: 'Solo expuestos',
    portsSummary: (tcp: number, udp: number, exposed: number) =>
      `${tcp} TCP · ${udp} UDP · ${exposed} TCP expuestos a la red`,
    protocol: 'Protocolo',
    address: 'Dirección',
    port: 'Puerto',
    service: 'Servicio',
    process: 'Proceso',
    user: 'Usuario',
    exposure: 'Exposición',
    exposures: { all: 'Todas las interfaces', loopback: 'Solo local', specific: 'IP específica' },
    noPorts: 'No hay puertos en escucha que coincidan.',

    dnsLookup: 'Consulta DNS',
    dnsLookupHint: 'Resuelve un nombre con el resolver del sistema, el de Chromium o preguntando directo a un servidor DNS.',
    domainInput: 'Dominio o IP',
    domainPlaceholder: 'Ej: midominio.com',
    recordType: 'Tipo de consulta',
    /** Solo los tipos que no se explican solos; el resto se muestra tal cual (A, MX, TXT...). */
    dnsTypeLabels: {
      SYSTEM: 'Sistema (incluye /etc/hosts)',
      CHROMIUM: 'Chromium (resolver de Electron)',
      PTR: 'PTR (inverso)'
    },
    dnsServer: 'Servidor DNS',
    dnsServerSystem: 'El del sistema',
    dnsServerCustom: 'Otro…',
    dnsServerPlaceholder: 'Ej: 192.168.1.1',
    query: 'Consultar',
    recordsFound: (count: number) => `${count} ${count === 1 ? 'registro' : 'registros'}`,
    answeredBy: (server: string, ms: number) => `${server} · ${ms} ms`,
    portCheck: 'Prueba de puertos TCP',
    portCheckHint: (max: number) => `Intenta abrir una conexión TCP a cada puerto, como "nc -z" (hasta ${max} por prueba).`,
    hostInput: 'Host',
    hostPlaceholder: 'Ej: 192.168.1.10 o midominio.com',
    portsInput: 'Puertos',
    portsPlaceholder: 'Ej: 22, 80, 443, 8000-8010',
    check: 'Probar',
    resolvedTo: (address: string) => `Resuelto a ${address}`,
    openCount: (open: number, total: number) => `${open} de ${total} abiertos`,
    state: 'Estado',
    latency: 'Latencia',
    portStates: { open: 'Abierto', closed: 'Cerrado', timeout: 'Sin respuesta', error: 'Error' },
    timeoutHint: '"Sin respuesta" suele significar que un firewall descarta los paquetes en vez de rechazarlos.',
    tlsInspect: 'Certificado TLS',
    tlsInspectHint: 'Se conecta al servidor y muestra el certificado que presenta, su cadena y la negociación TLS.',
    inspect: 'Inspeccionar',
    tlsTrusted: 'Certificado válido y de confianza para este host.',
    handshake: 'Handshake',
    subject: 'Sujeto',
    issuer: 'Emisor',
    validFrom: 'Válido desde',
    validTo: 'Válido hasta',
    altNames: 'Nombres (SAN)',
    key: 'Clave',
    serial: 'N° de serie',
    fingerprint: 'Huella SHA-256',
    daysRemaining: (days: number) => (days < 0 ? `Vencido hace ${-days} días` : `Vence en ${days} días`),
    selfSigned: 'Autofirmado',
    chain: 'Cadena de certificados',
    moreNames: (count: number) => `+${count} más`,
    trustStoreNote:
      'La confianza se valida contra los certificados raíz de Node.js, no contra el almacén del sistema: una CA corporativa aparecerá como no confiable.',
    validation: {
      hostRequired: 'Ingresa un host o dominio.',
      serverRequired: 'Ingresa la IP del servidor DNS.',
      invalidPorts: 'Puertos inválidos: usa números del 1 al 65535 separados por coma, o rangos como 8000-8010.',
      tooManyPorts: (max: number) => `Máximo ${max} puertos por prueba.`,
      invalidPort: 'Puerto inválido (1-65535).'
    },
    /** Códigos que manda el proceso main (c-ares, sockets, TLS); se muestran con el código entre paréntesis. */
    errors: {
      ENOTFOUND: 'El nombre no existe (NXDOMAIN)',
      ENODATA: 'No hay registros de ese tipo',
      ETIMEOUT: 'El servidor DNS no respondió a tiempo',
      ETIMEDOUT: 'Tiempo de espera agotado',
      ESERVFAIL: 'El servidor DNS falló al resolver (SERVFAIL)',
      EREFUSED: 'El servidor DNS rechazó la consulta',
      ECONNREFUSED: 'Conexión rechazada',
      ECONNRESET: 'La conexión se cortó',
      EHOSTUNREACH: 'Host inalcanzable',
      ENETUNREACH: 'Red inalcanzable',
      EAI_AGAIN: 'Fallo temporal de resolución DNS',
      EINVALIDHOST: 'Host inválido',
      EINVALIDIP: 'La consulta PTR requiere una IP',
      EINVALIDINPUT: 'Datos inválidos',
      CERT_HAS_EXPIRED: 'El certificado está vencido',
      CERT_NOT_YET_VALID: 'El certificado todavía no es válido',
      DEPTH_ZERO_SELF_SIGNED_CERT: 'Certificado autofirmado',
      SELF_SIGNED_CERT_IN_CHAIN: 'La cadena incluye una CA autofirmada que no es de confianza',
      UNABLE_TO_GET_ISSUER_CERT_LOCALLY: 'Falta un certificado intermedio o la CA no es de confianza',
      UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'Falta un certificado intermedio o la CA no es de confianza',
      ERR_TLS_CERT_ALTNAME_INVALID: 'El certificado no corresponde a este host'
    }
  },

  settings: {
    description:
      'Define el directorio de trabajo donde esta app guardará los archivos que genere y el idioma de la interfaz.',
    workingDirectory: 'Directorio de trabajo',
    workingDirectoryHint: 'Se usará como destino por defecto para los archivos generados.',
    noFolderSelected: 'Ninguna carpeta seleccionada',
    change: 'Cambiar',
    chooseFolder: 'Elegir carpeta',
    remove: 'Quitar',
    directoryConfigured: (saved: boolean) => `Directorio configurado${saved ? ' y guardado' : ''}.`,
    directoryMissing: 'Aún no se ha elegido un directorio de trabajo.',
    defaultDirectory: (path: ReactNode) => <>Se utilizará {path} por defecto.</>,
    directoryUpdated: 'Directorio de trabajo actualizado.',
    directorySaveError: 'No se pudo guardar el directorio de trabajo.',
    directoryRemoved: 'Se quitó el directorio de trabajo de la configuración.',
    directoryRemoveError: 'No se pudo quitar el directorio de trabajo.',
    removeDirectoryTitle: 'Quitar directorio de trabajo',
    removeDirectoryMessage:
      'Esto solo borra la referencia guardada en la configuración; la carpeta y su contenido en disco no se tocan. ¿Continuar?',
    language: 'Idioma',
    languageHint: 'Se aplica a la interfaz y a los comentarios de los scripts generados.',
    languageSaveError: 'No se pudo guardar el idioma.',
    configFile: 'Archivo de configuración',
    configFileHint: 'Registro JSON guardado en una carpeta de datos oculta del sistema operativo.',
    path: 'Ruta:',
    lastUpdated: 'Última actualización:',
    notSavedYet: '— (sin guardar aún)'
  },

  about: {
    description:
      'La navaja suiza de BeerCat para sysadmins: configuraciones y utilidades de uso frecuente, todas en un mismo lugar.',
    stackHint: 'Con qué está construida la app.',
    categories: 'Categorías disponibles',
    categoriesHint: 'Más utilidades y generadores van llegando por categoría.',
    engines: (count: number) => `${count} ${count === 1 ? 'motor' : 'motores'}`,
    internalUse: 'Uso interno BeerCat'
  },

  /** Textos compartidos por los modales de previsualización y guardado de archivos. */
  saveFile: {
    whereToSave: '¿Dónde guardar?',
    saveIn: 'Guardar en',
    chooseOtherLocation: 'Elegir otro lugar',
    chooseTargetFolder: 'Elegir carpeta destino...',
    noFolderSelected: 'No se ha seleccionado carpeta',
    filename: 'Nombre del archivo',
    saved: (path: string) => `Archivo guardado en: ${path}`,
    saveError: (error: string) => `Error al guardar archivo: ${error}`,
    existsTitle: 'El archivo ya existe',
    existsMessage: (path: string) => `Ya existe un archivo en: ${path}. ¿Deseas sobreescribirlo?`,
    overwrite: 'Sobrescribir'
  },

  /** Textos compartidos por Apache, Nginx y Caddy. */
  httpServer: {
    configurations: 'Configuraciones',
    empty: 'No hay configuraciones registradas — usa "Nueva" para agregar la primera.',
    created: 'Configuración creada exitosamente.',
    edited: 'Configuración editada exitosamente.',
    saveError: 'No se pudo guardar la configuración.',
    deleted: 'Configuración eliminada exitosamente.',
    deleteError: 'No se pudo eliminar la configuración.',
    deleteTitle: 'Eliminar configuración',
    newTitle: (tool: string) => `Nueva configuración ${tool}`,
    editTitle: (tool: string) => `Editar configuración ${tool}`,
    detailTitle: (tool: string) => `${tool} — Detalle de la configuración`,
    previewTitle: (file: string) => `Previsualización ${file}`,
    domains: 'Dominios',
    domainsInput: 'Dominios (separados por coma)',
    domainsPlaceholder: 'Ej: midominio.com, www.otrodominio.com',
    enableHttp: 'Habilitar HTTP (80)',
    enableHttps: 'Habilitar HTTPS (443)',
    redirectToHttps: 'Redirigir HTTP a HTTPS',
    pathPlaceholder: 'Ej: /var/www/html, /srv/misitio',
    proxyTargetInput: 'Proxy destino (IP:PUERTO)',
    proxyTargetPlaceholder: 'Ej: 127.0.0.1:3000, api.midominio.com:8080',
    sslCertificate: 'Certificado SSL',
    sslModes: {
      certbot: "Certbot (Let's Encrypt)",
      snakeoil: 'Snakeoil (por defecto)',
      custom: 'Personalizado'
    },
    certificate: 'Certificado',
    privateKey: 'Clave privada',
    certPathInput: 'Ruta del certificado (.crt/.pem)',
    certPathPlaceholder: 'Ej: /etc/ssl/certs/misitio.pem',
    keyPathInput: 'Ruta de la clave privada (.key)',
    keyPathPlaceholder: 'Ej: /etc/ssl/private/misitio.key',
    validation: {
      domainRequired: 'Debes ingresar al menos un dominio.',
      domainFormat: 'Todos los dominios deben tener formato válido (ej: midominio.com).',
      protocolRequired: 'Debes habilitar HTTP (80), HTTPS (443) o ambos.',
      certRequired: 'Debes ingresar la ruta del certificado y la clave privada.'
    }
  },

  apache: {
    description: 'Configuraciones de VirtualHost para Apache: dominios, HTTP/HTTPS, SSL y proxy inverso.',
    useDocumentRoot: 'Usar DocumentRoot',
    useReverseProxy: 'Usar proxy inverso',
    pathInput: 'Path del sitio (DocumentRoot)',
    proxyTarget: 'Proxy destino',
    pathRequired: 'El path del sitio es obligatorio.',
    proxyRequired: 'El destino del proxy es obligatorio.'
  },

  nginx: {
    description: 'Configuraciones de server block para Nginx: dominios, HTTP/HTTPS, SSL y proxy inverso.',
    domains: 'Dominios / server_name',
    domainsInput: 'Dominios / server_name (separados por coma)',
    serveStatic: 'Servir archivos estáticos (root)',
    useReverseProxy: 'Usar proxy inverso (proxy_pass)',
    pathInput: 'Path del sitio (root)',
    pathRequired: 'El path del sitio (root) es obligatorio.',
    proxyRequired: 'El destino del proxy_pass es obligatorio.'
  },

  caddy: {
    description: 'Configuraciones de sitio para Caddy: dominios, HTTPS automático, proxy inverso y archivos estáticos.',
    serveStatic: 'Servir archivos estáticos (root * + file_server)',
    useReverseProxy: 'Usar proxy inverso (reverse_proxy)',
    pathInput: 'Path del sitio (root)',
    /** Opciones del select del formulario. */
    tlsOptions: {
      auto: "Automático (Let's Encrypt, por defecto)",
      internal: 'Interno (autofirmado, para dominios locales)',
      custom: 'Personalizado',
      off: 'Desactivado (solo HTTP)'
    },
    /** Versión para el detalle de un registro. */
    tlsLabels: {
      auto: "Automático (Let's Encrypt)",
      internal: 'Interno (autofirmado)',
      custom: 'Personalizado',
      off: 'Desactivado (solo HTTP)'
    },
    /** Versión corta para la tabla. */
    tlsShort: {
      auto: 'Automático',
      internal: 'Interno',
      custom: 'Personalizado',
      off: 'Desactivado'
    },
    compressResponses: 'Comprimir respuestas (encode zstd gzip)',
    compression: 'Compresión',
    compressionEncode: 'Compresión (encode)',
    mode: 'Modo',
    modeProxy: 'Proxy',
    modeStatic: 'Estático',
    pathRequired: 'El path del sitio (root) es obligatorio.',
    proxyRequired: 'El destino del reverse_proxy es obligatorio.'
  },

  /** Textos compartidos por MySQL, PostgreSQL y MongoDB. */
  database: {
    empty: 'No hay scripts registrados — usa "Nueva" para agregar el primero.',
    created: 'Script creado exitosamente.',
    edited: 'Script editado exitosamente.',
    saveError: 'No se pudo guardar el script.',
    deleted: 'Script eliminado exitosamente.',
    deleteError: 'No se pudo eliminar el script.',
    deleteTitle: 'Eliminar script',
    newTitle: (tool: string) => `Nuevo script ${tool}`,
    editTitle: (tool: string) => `Editar script ${tool}`,
    detailTitle: (tool: string) => `${tool} — Detalle del script`,
    previewTitle: (kind: string) => `Vista previa del script ${kind}`,
    database: 'Base de datos',
    dbNameInput: 'Nombre de la base de datos',
    dbNamePlaceholder: 'ej: mi_programa_produccion',
    user: 'Usuario',
    userPlaceholder: 'ej: usuario_app, admin, lector',
    password: 'Contraseña',
    passwordPlaceholder: 'Contraseña segura para el usuario',
    generatePassword: 'Generar segura',
    privileges: 'Privilegios',
    privilegesPreset: 'Preset de privilegios',
    privilegesPlaceholder: 'Ej: SELECT, INSERT, UPDATE, DELETE',
    encoding: 'Codificación',
    custom: 'personalizado',
    allRequired: 'Todos los campos son obligatorios.',
    /** Etiquetas de los presets guardados (los valores en disco no cambian con el idioma). */
    presets: {
      personalizado: 'personalizado',
      produccion: 'producción',
      desarrollo: 'desarrollo',
      solo_lectura: 'solo_lectura'
    }
  },

  mysql: {
    description: 'Scripts de creación de base de datos, usuario y privilegios para MySQL.',
    allHosts: 'todos los hosts (%)',
    hostPlaceholder: 'Ej: 192.168.1.100, servidor.midominio.com',
    charsetInput: 'Codificación (charset)',
    utf8mb4: 'UTF-8 multibyte (recomendado)'
  },

  postgresql: {
    description: 'Scripts de creación de base de datos, rol y privilegios para PostgreSQL.',
    userRole: 'Usuario (rol)',
    presetOptions: {
      produccion: 'producción (sin ser owner)',
      desarrollo: 'desarrollo (owner, control total)'
    },
    tablePrivilegesInput: 'Privilegios sobre tablas',
    tablePrivileges: 'Privilegios (tablas)',
    allowedConnections: 'Conexiones permitidas',
    allowedConnectionsInput: 'Conexiones permitidas (pg_hba.conf)',
    hostLocal: 'solo localhost (127.0.0.1/32)',
    hostAll: 'todas las IPs (0.0.0.0/0)',
    hostCustom: 'personalizado (CIDR)',
    hostPlaceholder: 'Ej: 192.168.1.0/24',
    encodingInput: 'Codificación (encoding)',
    utf8: 'UTF8 (recomendado)',
    psqlNote: (
      <>
        Este script usa el modismo <code>\gexec</code> de psql, por lo que debe ejecutarse con{' '}
        <code>psql -U postgres -f archivo.sql</code> (no funciona pegado en un cliente SQL genérico).
      </>
    ),
    /** Comentarios del .sql generado, una línea por elemento (el generador antepone "-- "). */
    script: {
      hbaHint: (user: string) => [
        `Sugerencia de pg_hba.conf para permitir la conexion de "${user}"`,
        '(edita pg_hba.conf y recarga la config con: SELECT pg_reload_conf();)'
      ],
      openHbaWarning: ['Atencion: esto permite conexiones desde cualquier IP; usar solo en desarrollo.'],
      roleStep: ['1) Rol (usuario). CREATE ROLE no admite IF NOT EXISTS, se valida a mano.'],
      databaseStep: [
        '2) Base de datos. CREATE DATABASE tampoco admite IF NOT EXISTS ni corre dentro',
        '   de bloques DO ni transacciones; se usa el modismo \\gexec de psql',
        '   (ejecutar este archivo con: psql -U postgres -f archivo.sql).'
      ],
      privilegesStep: [
        '3) Privilegios. Se reconecta a la base para que los GRANT sobre el esquema',
        '   "public" apliquen ahi y no en la base actual de la sesion.'
      ],
      defaultPrivileges: [
        'Aplica los mismos privilegios a las tablas/secuencias que se creen despues.',
        'Nota: sólo cubre objetos creados por el rol que ejecuta este script; si las',
        'tablas las crea otro rol (p.ej. uno de migraciones), agrega "FOR ROLE <rol>".'
      ]
    }
  },

  mongodb: {
    description: 'Scripts mongosh para crear base, usuario y roles en MongoDB.',
    rolePreset: 'Preset de rol',
    presetOptions: {
      produccion: 'producción (readWrite)',
      desarrollo: 'desarrollo (dbOwner, control total)',
      solo_lectura: 'solo_lectura (read)'
    },
    rolesInput: 'Roles (sobre esta base)',
    rolesPlaceholder: 'Ej: readWrite  ó  read, dbAdmin',
    authDb: 'Base de autenticación',
    authDbInput: 'Base de autenticación (authSource)',
    authDbSame: (dbName: string) => `la misma base (${dbName})`,
    authDbAdmin: 'admin (usuario administrativo)',
    authDbPlaceholder: 'Ej: admin, otra_base',
    bindIpInput: 'IP(s) de escucha (bindIp)',
    bindIpLocal: 'solo localhost (127.0.0.1)',
    bindIpAll: 'todas las interfaces (0.0.0.0)',
    bindIpPlaceholder: 'Ej: 10.0.0.5,10.0.0.6 (IPs puntuales, no CIDR)',
    createInitialCollection: (
      <>
        Crear colección inicial "_init" (Mongo no muestra bases vacías en <code>show dbs</code>)
      </>
    ),
    initialCollection: 'Colección inicial',
    adminSessionNote: (
      <>
        Este script se ejecuta con una sesión ya autenticada con privilegios de administrador, por ejemplo:{' '}
        <code>mongosh "mongodb://admin:pass@localhost:27017/admin" --file archivo.js</code>.
      </>
    ),
    uri: {
      title: 'MongoDB — Generar URI de conexión',
      scheme: 'Esquema',
      schemeStandard: 'mongodb:// (estándar, admite varios hosts)',
      schemeSrv: 'mongodb+srv:// (DNS seedlist, ej: Atlas)',
      hostSrv: 'Host (sin puerto)',
      hostsStandard: 'Host(s):puerto',
      replicaSet: 'Replica set (opcional)',
      replicaSetPlaceholder: 'Ej: rs0 — dejar vacío si no aplica (con mongodb+srv normalmente no hace falta)',
      enableTls: (
        <>
          Habilitar TLS (<code>tls=true</code>)
        </>
      ),
      retryWrites: (
        <>
          <code>retryWrites=true&amp;w=majority</code> — solo válido contra un replica set o cluster; falla contra un
          mongod standalone
        </>
      ),
      generatedUri: 'URI generada'
    },
    /** Comentarios y mensajes del .js generado (el generador antepone "// " a cada línea). */
    script: {
      confHint: [
        'Sugerencia de mongod.conf para exponer el servicio solo donde corresponde',
        '(edita mongod.conf y reinicia el servicio: sudo systemctl restart mongod)'
      ],
      bindIpNote: [
        'Nota: bindIp solo acepta IPs/hostnames puntuales (no rangos CIDR); para',
        'restringir por rango usa el firewall del sistema (ufw/iptables/security group).'
      ],
      openBindIpWarning: [
        'Atencion: 0.0.0.0 expone MongoDB a cualquier IP. Sin autenticacion habilitada',
        'y sin firewall, la instancia queda accesible desde internet.'
      ],
      authorizationNote: [
        'Sin "security.authorization: enabled" en mongod.conf, el usuario creado acá',
        'no restringe nada: cualquiera puede conectarse sin autenticarse.'
      ],
      runAsAdmin: [
        'Ejecutar ya autenticado con un usuario admin (userAdmin/root), por ejemplo:',
        '  mongosh "mongodb://admin:pass@localhost:27017/admin" --file archivo.js'
      ],
      createUserNote: ['createUser no admite "si no existe"; se valida a mano con getUser().'],
      // Los *Print son expresiones JS (no texto plano): van tal cual dentro de print() y
      // concatenan variables del propio script generado (userName, authDb, dbName).
      userExistsPrint: `'El usuario "' + userName + '" ya existe en "' + authDb.getName() + '"; no se vuelve a crear.'`,
      userCreatedPrint: `'Usuario "' + userName + '" creado en "' + authDb.getName() + '".'`,
      initialCollectionNote: [
        'Mongo no persiste una base vacía: recién aparece en "show dbs" cuando tiene',
        'al menos una colección. Este placeholder fuerza su creación.'
      ],
      initialCollectionPrint: `'Colección "_init" creada para inicializar "' + dbName + '".'`,
      suggestedUri: [
        'Cadena de conexión sugerida para la aplicación (ajusta host:puerto según el despliegue;',
        'usa "Generar URI" para armar variantes con replica set, mongodb+srv o TLS):'
      ]
    }
  }
}

export type Dictionary = typeof es
