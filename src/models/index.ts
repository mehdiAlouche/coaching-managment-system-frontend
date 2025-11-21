// ==============================
// USER AND AUTH
// ==============================

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  COACH = 'coach',
  ENTREPRENEUR = 'entrepreneur',
  STARTUP = 'startup',
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  organizationId: string;
  hourlyRate?: number;
  startupName?: string;
  phone?: string;
  timezone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}



export interface AuthLoginResponse {
  token: string;
  user: User;
}

// ==============================
// SESSION
// ==============================
export interface Session {
  _id: string;
  organizationId: string;
  coachId: string | User;
  entrepreneur: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    startupName?: string;
  };
  manager: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledAt: string; // ISO
  endTime: string; // ISO
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled' | string;
  agendaItems: AgendaItem[];
  notes: Record<string, any>; // notes is an object
  location?: string;
  videoConferenceUrl?: string;
}

export interface AgendaItem {
  title: string;
  description?: string;
  duration: number; // in minutes
}

// ==============================
// GOAL
// ==============================
export interface Goal {
  _id: string;
  organizationId: string;
  entrepreneurId: string;
  coachId: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | string;
  priority: 'low' | 'medium' | 'high' | string;
  progress: number; // 0-100
  targetDate?: string;
  isArchived: boolean;
  milestones: Milestone[];
  linkedSessions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  title: string;
  status: string;
  targetDate: string;
  completedAt?: string;
  notes?: string;
}

// ==============================
// PAYMENT (INVOICE)
// ==============================
export interface Payment {
  _id: string;
  organizationId: string;
  coachId: string;
  sessionIds: string[];
  lineItems: PaymentLineItem[];
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'void' | string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLineItem {
  sessionId: string;
  description: string;
  duration: number;
  rate: number;
  amount: number;
}

// ==============================
// ORGANIZATION
// ==============================
export interface Organization {
  _id: string;
  name: string;
  logoUrl?: string;
  settings?: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  [key: string]: string | number | boolean;
}

// ==============================
// ROLE
// ==============================
export interface Role {
  _id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// ==============================
// PAGINATION RESPONSE
// ==============================
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// ==============================
// DASHBOARD (Stats/Analytics)
// ==============================
export interface DashboardStats {
  users: {
    total: number;
    coaches: number;
    entrepreneurs: number;
  }
  sessions: {
    total: number;
    upcoming: number;
    completed: number;
  }
  revenue: {
    total: number;
  }
}

export interface DashboardGoalsByCategory {
  byStatus: {
    not_started: number,
    in_progress: number,
    completed: number,
    blocked: number
  },
  byPriority: {
    low: number,
    medium: number,
    high: number,
  }
}

// ==============================
// GENERIC ENTITIES/TABLES
// ==============================
export interface SimpleEntity {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: any;
}