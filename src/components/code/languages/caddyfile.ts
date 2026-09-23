/**
 * react-syntax-highlighter/Prism no trae un lenguaje "caddyfile" incluido,
 * así que se define acá una gramática mínima (mismo formato que las de
 * refractor: una función que recibe la instancia de Prism y le agrega
 * `Prism.languages.caddyfile`).
 */
export default function caddyfile(Prism: any): void {
  Prism.languages.caddyfile = {
    comment: /#.*/,
    string: {
      pattern: /"(?:\\.|[^"\\])*"/,
      greedy: true
    },
    placeholder: {
      pattern: /\{[$.\w-]+\}/,
      alias: 'variable'
    },
    directive: {
      pattern:
        /^[ \t]*\b(?:reverse_proxy|file_server|root|tls|redir|encode|header|log|handle|handle_path|respond|import|basicauth|php_fastcgi|try_files|rewrite|templates|push|uri|route|request_body)\b/m,
      alias: 'keyword'
    },
    punctuation: /[{}]/,
    scheme: {
      pattern: /\bhttps?:\/\//,
      alias: 'property'
    }
  }
}
