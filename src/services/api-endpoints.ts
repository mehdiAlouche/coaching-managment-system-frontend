/**
 * API Endpoints Configuration
 * All endpoints are loaded from environment variables
 * If not set, defaults are used (for backward compatibility)
 */

const replaceParams = (endpoint: string, params: Record<string, string>): string => {
  let result = endpoint
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value)
  })
  return result
}

const endpoints = {
  // ─────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────
  auth: {
    login: import.meta.env.VITE_API_ENDPOINT_AUTH_LOGIN || '/auth/login',
    me: import.meta.env.VITE_API_ENDPOINT_AUTH_ME || '/auth/me',
    refresh: import.meta.env.VITE_API_ENDPOINT_AUTH_REFRESH || '/auth/refresh',
    logout: import.meta.env.VITE_API_ENDPOINT_AUTH_LOGOUT || '/auth/logout',
  },

  // ─────────────────────────────────────────
  // SESSIONS
  // ─────────────────────────────────────────
  sessions: {
    list: import.meta.env.VITE_API_ENDPOINT_SESSIONS_LIST || '/sessions',
    create: import.meta.env.VITE_API_ENDPOINT_SESSIONS_CREATE || '/sessions',
    conflictCheck: import.meta.env.VITE_API_ENDPOINT_SESSIONS_CONFLICT_CHECK || '/sessions/check-conflict',
    calendar: import.meta.env.VITE_API_ENDPOINT_SESSIONS_CALENDAR || '/sessions/calendar',

    get: (sessionId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_GET || '/sessions/:sessionId'
      return replaceParams(template, { sessionId })
    },

    update: (sessionId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_UPDATE || '/sessions/:sessionId'
      return replaceParams(template, { sessionId })
    },

    partialUpdate: (sessionId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_PATCH || '/sessions/:sessionId'
      return replaceParams(template, { sessionId })
    },

    delete: (sessionId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_DELETE || '/sessions/:sessionId'
      return replaceParams(template, { sessionId })
    },

    statusUpdate: (sessionId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_STATUS_UPDATE || '/sessions/:sessionId/status'
      return replaceParams(template, { sessionId })
    },

    rate: (sessionId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_RATE || '/sessions/:sessionId/rating'
      return replaceParams(template, { sessionId })
    },

    // Session Notes
    notes: {
      list: (sessionId: string) => {
        const template = import.meta.env.VITE_API_ENDPOINT_SESSION_NOTES_LIST ||
          '/sessions/:sessionId/notes'
        return replaceParams(template, { sessionId })
      },
      create: (sessionId: string) => {
        const template = import.meta.env.VITE_API_ENDPOINT_SESSION_NOTES_CREATE ||
          '/sessions/:sessionId/notes'
        return replaceParams(template, { sessionId })
      },
      patch: (sessionId: string) => {
        const template = import.meta.env.VITE_API_ENDPOINT_SESSIONS_NOTES_PATCH ||
          '/sessions/:sessionId/notes'
        return replaceParams(template, { sessionId })
      }
    }
  },

  // ─────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────
  dashboard: {
    stats: import.meta.env.VITE_API_ENDPOINT_DASHBOARD_STATS || '/dashboard/stats',

    sessions: import.meta.env.VITE_API_ENDPOINT_DASHBOARD_SESSIONS ||
      '/dashboard/sessions',

    goalsByCategory: import.meta.env.VITE_API_ENDPOINT_DASHBOARD_GOALS_CATEGORY ||
      '/dashboard/goals-category',

    revenue: import.meta.env.VITE_API_ENDPOINT_DASHBOARD_REVENUE ||
      '/dashboard/revenue',

    manager: import.meta.env.VITE_API_ENDPOINT_DASHBOARD_MANAGER || '/dashboard/manager',
    coach: import.meta.env.VITE_API_ENDPOINT_DASHBOARD_COACH || '/dashboard/coach',
    entrepreneur: import.meta.env.VITE_API_ENDPOINT_DASHBOARD_ENTREPRENEUR || '/dashboard/entrepreneur',
  },

  // ─────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────
  users: {
    list: import.meta.env.VITE_API_ENDPOINT_USERS_LIST || '/users',
    create: import.meta.env.VITE_API_ENDPOINT_USERS_CREATE || '/users',

    get: (userId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_USERS_GET || '/users/:userId'
      return replaceParams(template, { userId })
    },

    update: (userId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_USERS_UPDATE || '/users/:userId'
      return replaceParams(template, { userId })
    },

    partialUpdate: (userId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_USERS_PATCH || '/users/:userId'
      return replaceParams(template, { userId })
    },

    delete: (userId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_USERS_DELETE || '/users/:userId'
      return replaceParams(template, { userId })
    },

    rolePatch: (userId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_USERS_ROLE_PATCH || '/users/:userId/role'
      return replaceParams(template, { userId })
    },

    sessions: (userId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_USERS_SESSIONS || '/users/:userId/sessions'
      return replaceParams(template, { userId })
    },

    goals: (userId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_USERS_GOALS || '/users/:userId/goals'
      return replaceParams(template, { userId })
    },

    payments: (userId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_USERS_PAYMENTS || '/users/:userId/payments'
      return replaceParams(template, { userId })
    },
  },

  // ─────────────────────────────────────────
  // GOALS
  // ─────────────────────────────────────────
  goals: {
    list: import.meta.env.VITE_API_ENDPOINT_GOALS_LIST || '/goals',
    create: import.meta.env.VITE_API_ENDPOINT_GOALS_CREATE || '/goals',

    get: (goalId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_GOALS_GET || '/goals/:goalId'
      return replaceParams(template, { goalId })
    },

    update: (goalId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_GOALS_UPDATE || '/goals/:goalId'
      return replaceParams(template, { goalId })
    },

    partialUpdate: (goalId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_GOALS_PATCH || '/goals/:goalId'
      return replaceParams(template, { goalId })
    },

    delete: (goalId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_GOALS_DELETE || '/goals/:goalId'
      return replaceParams(template, { goalId })
    },

    progressUpdate: (goalId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_GOALS_PROGRESS_UPDATE || '/goals/:goalId/progress'
      return replaceParams(template, { goalId })
    },

    milestoneStatus: (goalId: string, milestoneId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_GOALS_MILESTONE_STATUS || '/goals/:goalId/milestones/:milestoneId'
      return replaceParams(template, { goalId, milestoneId })
    },

    addComment: (goalId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_GOALS_ADD_COMMENT || '/goals/:goalId/comments'
      return replaceParams(template, { goalId })
    },

    addCollaborator: (goalId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_GOALS_ADD_COLLABORATOR || '/goals/:goalId/collaborators'
      return replaceParams(template, { goalId })
    },

    linkSession: (goalId: string, sessionId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_GOALS_LINK_SESSION || '/goals/:goalId/sessions/:sessionId'
      return replaceParams(template, { goalId, sessionId })
    },
  },

  // ─────────────────────────────────────────
  // PAYMENTS
  // ─────────────────────────────────────────
  payments: {
    list: import.meta.env.VITE_API_ENDPOINT_PAYMENTS_LIST || '/payments',
    create: import.meta.env.VITE_API_ENDPOINT_PAYMENTS_CREATE || '/payments',
    generate: import.meta.env.VITE_API_ENDPOINT_PAYMENTS_GENERATE || '/payments/generate',
    stats: import.meta.env.VITE_API_ENDPOINT_PAYMENTS_STATS || '/payments/stats',

    get: (paymentId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_PAYMENTS_GET || '/payments/:paymentId'
      return replaceParams(template, { paymentId })
    },

    update: (paymentId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_PAYMENTS_UPDATE || '/payments/:paymentId'
      return replaceParams(template, { paymentId })
    },

    patch: (paymentId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_PAYMENTS_PATCH || '/payments/:paymentId'
      return replaceParams(template, { paymentId })
    },

    markPaid: (paymentId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_PAYMENTS_MARK_PAID || '/payments/:paymentId/mark-paid'
      return replaceParams(template, { paymentId })
    },

    invoiceDownload: (paymentId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_PAYMENTS_INVOICE_DOWNLOAD || '/payments/:paymentId/invoice/download'
      return replaceParams(template, { paymentId })
    },

    send: (paymentId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_PAYMENTS_SEND || '/payments/:paymentId/send'
      return replaceParams(template, { paymentId })
    },

    invoice: (paymentId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_PAYMENTS_INVOICE || '/payments/:paymentId/invoice'
      return replaceParams(template, { paymentId })
    },

    sendInvoice: (paymentId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_PAYMENTS_SEND_INVOICE || '/payments/:paymentId/send-invoice'
      return replaceParams(template, { paymentId })
    },
  },

  // ─────────────────────────────────────────
  // STARTUPS
  // ─────────────────────────────────────────
  startups: {
    list: import.meta.env.VITE_API_ENDPOINT_STARTUPS_LIST || '/startups',
    get: (startupId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_STARTUPS_GET ||
        '/startups/:startupId'
      return replaceParams(template, { startupId })
    },
  },

  // ─────────────────────────────────────────
  // ACTIVITY
  // ─────────────────────────────────────────
  activity: {
    list: import.meta.env.VITE_API_ENDPOINT_ACTIVITY_LIST || '/activities',
    create: import.meta.env.VITE_API_ENDPOINT_ACTIVITY_CREATE || '/activities',
  },

  // ─────────────────────────────────────────
  // EXPORT
  // ─────────────────────────────────────────
  export: {
    dashboard: import.meta.env.VITE_API_ENDPOINT_EXPORT_DASHBOARD ||
      '/exports/dashboard',
  },

  // ─────────────────────────────────────────
  // ORGANIZATION
  // ─────────────────────────────────────────
  organization: {
    get: import.meta.env.VITE_API_ENDPOINT_ORGANIZATION_GET || '/organization',
    update: import.meta.env.VITE_API_ENDPOINT_ORGANIZATION_UPDATE || '/organization',
    uploadLogo: import.meta.env.VITE_API_ENDPOINT_ORGANIZATION_UPLOAD_LOGO ||
      '/organization/logo',
  },

  // ─────────────────────────────────────────
  // ROLES
  // ─────────────────────────────────────────
  roles: {
    list: import.meta.env.VITE_API_ENDPOINT_ROLES_LIST || '/roles',
    create: import.meta.env.VITE_API_ENDPOINT_ROLES_CREATE || '/roles',

    update: (roleId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_ROLES_UPDATE || '/roles/:roleId'
      return replaceParams(template, { roleId })
    },

    delete: (roleId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_ROLES_DELETE || '/roles/:roleId'
      return replaceParams(template, { roleId })
    },
  },

  // ─────────────────────────────────────────
  // FILE UPLOAD
  // ─────────────────────────────────────────
  files: {
    upload: import.meta.env.VITE_API_ENDPOINT_FILES_UPLOAD || '/upload',
    delete: (fileId: string) => {
      const template = import.meta.env.VITE_API_ENDPOINT_FILES_DELETE || '/upload/:fileId'
      return replaceParams(template, { fileId })
    }
  },

  // ─────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────
  notifications: {
    list: import.meta.env.VITE_API_ENDPOINT_NOTIFICATIONS_LIST || '/notifications',
    unreadCount: import.meta.env.VITE_API_ENDPOINT_NOTIFICATIONS_UNREAD_COUNT || '/notifications/unread-count',
    markAllRead: import.meta.env.VITE_API_ENDPOINT_NOTIFICATIONS_MARK_ALL_READ || '/notifications/mark-all-read',

    read: (notificationId: string) => {
      const template =
        import.meta.env.VITE_API_ENDPOINT_NOTIFICATIONS_READ ||
        '/notifications/:notificationId/read'
      return replaceParams(template, { notificationId })
    },

    markRead: (notificationId: string) => {
      const template =
        import.meta.env.VITE_API_ENDPOINT_NOTIFICATIONS_READ ||
        '/notifications/:notificationId/read'
      return replaceParams(template, { notificationId })
    },

    delete: (notificationId: string) => {
      const template =
        import.meta.env.VITE_API_ENDPOINT_NOTIFICATIONS_DELETE ||
        '/notifications/:notificationId'
      return replaceParams(template, { notificationId })
    }
  },

  // ─────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────
  search: {
    global: import.meta.env.VITE_API_ENDPOINT_SEARCH || '/search',
  }
} as const

export default endpoints
