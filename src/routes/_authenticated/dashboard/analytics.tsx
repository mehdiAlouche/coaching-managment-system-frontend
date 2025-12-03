import { createFileRoute } from '@tanstack/react-router'
import { useSessionsChart, useGoalsCategoryChart, useRevenueChart, usePaymentStats } from '@/hooks'
import { SessionsChart } from '@/components/charts/SessionsChart'
import { GoalsPieChart } from '@/components/charts/GoalsPieChart'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { PaymentStatsCard } from '@/components/charts/PaymentStatsCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useExportDashboard } from '@/hooks'
import { UserRole } from '@/models'
import { useAuth } from '@/context/AuthContext'

export const Route = createFileRoute('/_authenticated/dashboard/analytics')({
  component: AnalyticsDashboard,
})

function AnalyticsDashboard() {
  const { user } = useAuth()
  const { data: sessionsData, isLoading: sessionsLoading } = useSessionsChart()
  const { data: goalsData, isLoading: goalsLoading } = useGoalsCategoryChart()
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart()
  const { data: paymentStats, isLoading: statsLoading } = usePaymentStats()
  const exportMutation = useExportDashboard()

  const handleExport = () => {
    exportMutation.mutate(undefined)
  }

  const isLoading = sessionsLoading || goalsLoading || revenueLoading || statsLoading

  // Only managers and admins should see full analytics
  const canViewAnalytics = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN

  if (!canViewAnalytics) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to view analytics dashboard.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Comprehensive insights into your coaching organization
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            variant="outline"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </div>

        {/* Payment Statistics */}
        {paymentStats && (
          <div className="mb-8">
            <PaymentStatsCard stats={paymentStats} />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sessions Chart */}
          {sessionsData && sessionsData.length > 0 ? (
            <SessionsChart data={sessionsData} />
          ) : (
            !sessionsLoading && (
              <Card className="p-6 flex items-center justify-center min-h-[350px]">
                <p className="text-muted-foreground">No session data available</p>
              </Card>
            )
          )}

          {/* Goals Pie Chart */}
          {goalsData ? (
            <GoalsPieChart data={goalsData} />
          ) : (
            !goalsLoading && (
              <Card className="p-6 flex items-center justify-center min-h-[350px]">
                <p className="text-muted-foreground">No goals data available</p>
              </Card>
            )
          )}
        </div>

        {/* Revenue Chart - Full Width */}
        {revenueData && revenueData.length > 0 ? (
          <div className="mb-8">
            <RevenueChart data={revenueData} />
          </div>
        ) : (
          !revenueLoading && (
            <Card className="p-6 flex items-center justify-center min-h-[350px] mb-8">
              <p className="text-muted-foreground">No revenue data available</p>
            </Card>
          )
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Additional Insights */}
        {paymentStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Total Invoices
              </h3>
              <p className="text-3xl font-bold text-foreground">
                {paymentStats.totalInvoices}
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="text-green-600">{paymentStats.paidInvoices} paid</span>
                {' • '}
                <span className="text-amber-600">{paymentStats.pendingInvoices} pending</span>
                {' • '}
                <span className="text-red-600">{paymentStats.overdueInvoices} overdue</span>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Average Payment Time
              </h3>
              <p className="text-3xl font-bold text-foreground">
                {paymentStats.averagePaymentTime} days
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Time from invoice to payment
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Collection Rate
              </h3>
              <p className="text-3xl font-bold text-foreground">
                {paymentStats.totalRevenue > 0
                  ? Math.round((paymentStats.paidAmount / paymentStats.totalRevenue) * 100)
                  : 0}%
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Percentage of revenue collected
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
