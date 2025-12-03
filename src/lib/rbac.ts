// Role-Based Access Control (RBAC) helper
// Defines roles, actions, subjects, and a permission matrix with a type-safe can() API.
import type { UserRole, RbacContext } from '../models'

export type { UserRole, RbacContext }

export type Action =
	| 'view'
	| 'manage'
	| 'create'
	| 'edit'
	| 'delete'
	| 'invoice'
	| 'configure'

export type Subject =
	| 'sessions'
	| 'goals'
	| 'payments'
	| 'users'
	| 'orgSettings'
	| 'feedback'


type PermissionMatrix = {
	[role in UserRole]: {
		[subject in Subject]?: Action[]
	}
}

// Matrix based on the provided permission table and descriptions
const PERMISSIONS: PermissionMatrix = {
	manager: {
		sessions: ['view', 'manage', 'create', 'edit', 'delete'],
		goals: ['view', 'manage', 'create', 'edit', 'delete'], // Can do everything
		payments: ['view', 'manage', 'invoice', 'edit'],
		users: ['view', 'manage', 'create', 'edit', 'delete'],
		orgSettings: ['view', 'configure', 'edit'],
		feedback: ['view'],
	},
	coach: {
		sessions: ['view', 'edit'], // manage own as host will be enforced at call-site by ownership checks
		goals: ['view', 'create', 'edit'], // Can create, view, and edit own goals
		payments: ['view'],
		users: [], // none
		orgSettings: [], // none
		feedback: ['view'],
	},
	entrepreneur: {
		sessions: ['view'], // own only enforced at call-site
		goals: ['view'], // Can only view own goals and update progress (progress update is separate)
		payments: [], // none
		users: [], // none
		orgSettings: [], // none
		feedback: ['create'], // submit only
	},
	admin: {
		sessions: ['view', 'manage', 'create', 'edit', 'delete'],
		goals: ['view', 'manage', 'create', 'edit', 'delete'],
		payments: ['view', 'manage', 'invoice', 'edit', 'delete'],
		users: ['view', 'manage', 'create', 'edit', 'delete'],
		orgSettings: ['view', 'configure', 'edit'],
		feedback: ['view'],
	},
}

export function can(
	context: RbacContext,
	action: Action,
	subject: Subject
): boolean {
	const allowed = PERMISSIONS[context.role]?.[subject]
	if (!allowed) return false
	return allowed.includes(action)
}

export function hasRole(context: RbacContext, ...roles: UserRole[]): boolean {
	return roles.includes(context.role)
}

// Convenience guards to reduce duplication in UI
export const canView = (ctx: RbacContext, subject: Subject) => can(ctx, 'view', subject)
export const canManage = (ctx: RbacContext, subject: Subject) => can(ctx, 'manage', subject)
export const canCreate = (ctx: RbacContext, subject: Subject) => can(ctx, 'create', subject)
export const canEdit = (ctx: RbacContext, subject: Subject) => can(ctx, 'edit', subject)
export const canDelete = (ctx: RbacContext, subject: Subject) => can(ctx, 'delete', subject)
export const canInvoice = (ctx: RbacContext) => can(ctx, 'invoice', 'payments')
export const canConfigure = (ctx: RbacContext) => can(ctx, 'configure', 'orgSettings')


