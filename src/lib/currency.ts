/**
 * Currency utility functions for the coaching management system
 */

/**
 * Format an amount in MAD currency
 */
export function formatCurrency(amount: number, currency: string = 'MAD'): string {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount)
}

/**
 * Format currency without symbol (just the number)
 */
export function formatCurrencyValue(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount)
}

/**
 * Calculate total from an array of amounts
 */
export function calculateTotal(amounts: number[]): number {
    return amounts.reduce((sum, amount) => sum + amount, 0)
}

/**
 * Calculate session cost based on duration and hourly rate
 */
export function calculateSessionCost(durationMinutes: number, hourlyRate: number): number {
    const hours = durationMinutes / 60
    return hours * hourlyRate
}

/**
 * Format a compact currency value (e.g., 2.5K, 1.2M)
 */
export function formatCompactCurrency(amount: number, currency: string = 'MAD'): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M ${currency}`
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K ${currency}`
    } else {
        return formatCurrency(amount, currency)
    }
}
