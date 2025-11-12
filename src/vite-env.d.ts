/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_ENV: string
  
  // Auth endpoints
  readonly VITE_API_ENDPOINT_AUTH_LOGIN?: string
  readonly VITE_API_ENDPOINT_AUTH_REGISTER?: string
  readonly VITE_API_ENDPOINT_AUTH_ME?: string
  
  // Session endpoints
  readonly VITE_API_ENDPOINT_SESSIONS_LIST?: string
  readonly VITE_API_ENDPOINT_SESSIONS_CREATE?: string
  readonly VITE_API_ENDPOINT_SESSIONS_GET?: string
  readonly VITE_API_ENDPOINT_SESSIONS_UPDATE?: string
  readonly VITE_API_ENDPOINT_SESSIONS_DELETE?: string
  
  // Dashboard endpoints
  readonly VITE_API_ENDPOINT_DASHBOARD_STATS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

