/**
 * API Endpoints Configuration
 * All endpoints are loaded from environment variables
 * If not set, defaults are used (for backward compatibility)
 */

// Helper function to replace route parameters
const replaceParams = (endpoint: string, params: Record<string, string>): string => {
  let result = endpoint
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value)
  })
  return result
}

const endpoints = {
  // Auth endpoints
  auth: {
    login: import.meta.env.VITE_API_ENDPOINT_AUTH_LOGIN || '/auth/login',
    register: import.meta.env.VITE_API_ENDPOINT_AUTH_REGISTER || '/auth/register',
    me: import.meta.env.VITE_API_ENDPOINT_AUTH_ME || '/auth/me',
  },
  
  // Session endpoints
  sessions: {
    list: import.meta.env.VITE_API_ENDPOINT_SESSIONS_LIST || '/sessions',
    create: import.meta.env.VITE_API_ENDPOINT_SESSIONS_CREATE || '/sessions',
    get: (id: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_GET || '/sessions/:id'
      return replaceParams(template, { id })
    },
    update: (id: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_UPDATE || '/sessions/:id'
      return replaceParams(template, { id })
    },
    delete: (id: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_DELETE || '/sessions/:id'
      return replaceParams(template, { id })
    },
  },
  
  // Dashboard endpoints
  dashboard: {
    stats: import.meta.env.VITE_API_ENDPOINT_DASHBOARD_STATS || '/dashboard/stats',
  },
} as const

export default endpoints

