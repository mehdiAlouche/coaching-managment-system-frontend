/**
 * Date utility functions for the coaching management system
 */

/**
 * Format a relative time string (e.g., "5 days left", "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const now = new Date()
    const target = new Date(date)
    const diffMs = target.getTime() - now.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMs < 0) {
        // Past dates
        const absDays = Math.abs(diffDays)
        const absHours = Math.abs(diffHours)
        const absMins = Math.abs(diffMins)

        if (absDays > 0) {
            return `${absDays} day${absDays !== 1 ? 's' : ''} ago`
        } else if (absHours > 0) {
            return `${absHours} hour${absHours !== 1 ? 's' : ''} ago`
        } else if (absMins > 0) {
            return `${absMins} minute${absMins !== 1 ? 's' : ''} ago`
        } else {
            return 'just now'
        }
    } else {
        // Future dates
        if (diffDays > 0) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`
        } else if (diffMins > 0) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} left`
        } else {
            return 'now'
        }
    }
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: string | Date): boolean {
    const now = new Date()
    const target = new Date(date)
    return target < now
}

/**
 * Get the number of days remaining until a deadline
 */
export function getDaysRemaining(deadline: string | Date): number {
    const now = new Date()
    const target = new Date(deadline)
    const diffMs = target.getTime() - now.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Format a date range for sessions
 */
export function formatDateRange(startTime: string | Date, endTime: string | Date): string {
    const start = new Date(startTime)
    const end = new Date(endTime)

    const dateStr = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    const startTimeStr = start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })

    const endTimeStr = end.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return `${dateStr} at ${startTimeStr} - ${endTimeStr}`
}

/**
 * Format a date in a friendly way
 */
export function formatFriendlyDate(date: string | Date): string {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        return 'Today'
    } else if (diffDays === 1) {
        return 'Tomorrow'
    } else if (diffDays === -1) {
        return 'Yesterday'
    } else if (diffDays > 1 && diffDays < 7) {
        return d.toLocaleDateString('en-US', { weekday: 'long' })
    } else {
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })
    }
}

/**
 * Get time until a session starts
 */
export function getTimeUntilSession(startTime: string | Date): string {
    const now = new Date()
    const start = new Date(startTime)
    const diffMs = start.getTime() - now.getTime()

    if (diffMs < 0) {
        return 'Started'
    }

    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
        return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
    } else if (diffHours > 0) {
        return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
    } else if (diffMins > 0) {
        return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`
    } else {
        return 'now'
    }
}
