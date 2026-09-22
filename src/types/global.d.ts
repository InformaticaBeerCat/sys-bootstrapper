import type { SysBootstrapperApi } from '../../electron/preload/index'

declare global {
  interface Window {
    sysBootstrapper: SysBootstrapperApi
  }
}

export {}
