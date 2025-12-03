# New Features Implementation Guide

This document describes all the newly implemented features for analytics, organization settings, file management, and data export.

## 📊 Analytics & Charts

### New Hooks

#### `useSessionsChart()`
Fetches session statistics over time for charting.

```typescript
import { useSessionsChart } from '@/hooks'

const { data, isLoading } = useSessionsChart()
// Returns: SessionsChartData[] with scheduled, completed, cancelled counts
```

#### `useGoalsCategoryChart()`
Fetches goals breakdown by status and priority.

```typescript
import { useGoalsCategoryChart } from '@/hooks'

const { data, isLoading } = useGoalsCategoryChart()
// Returns: GoalsCategoryData with byStatus and byPriority breakdowns
```

#### `useRevenueChart()`
Fetches revenue data over time for trend analysis.

```typescript
import { useRevenueChart } from '@/hooks'

const { data, isLoading } = useRevenueChart()
// Returns: RevenueChartData[] with date, revenue, and sessions
```

#### `usePaymentStats()`
Fetches comprehensive payment statistics.

```typescript
import { usePaymentStats } from '@/hooks'

const { data, isLoading } = usePaymentStats()
// Returns: PaymentStats with detailed revenue metrics
```

### New Chart Components

#### SessionsChart
Bar chart displaying sessions by status over time.

```tsx
import { SessionsChart } from '@/components/charts/SessionsChart'

<SessionsChart data={sessionsData} title="Sessions Overview" />
```

#### GoalsPieChart
Pie chart with tabs showing goals by status and priority.

```tsx
import { GoalsPieChart } from '@/components/charts/GoalsPieChart'

<GoalsPieChart data={goalsData} title="Goals by Category" />
```

#### RevenueChart
Area chart showing revenue trends.

```tsx
import { RevenueChart } from '@/components/charts/RevenueChart'

<RevenueChart data={revenueData} title="Revenue Overview" currency="USD" />
```

#### PaymentStatsCard
Grid of payment statistics cards.

```tsx
import { PaymentStatsCard } from '@/components/charts/PaymentStatsCard'

<PaymentStatsCard stats={paymentStats} currency="USD" />
```

### Analytics Dashboard

A complete analytics dashboard is available at `/dashboard/analytics`:

```typescript
// Access via navigation or direct link
navigate({ to: '/dashboard/analytics' })
```

**Features:**
- Payment statistics overview
- Sessions bar chart
- Goals pie chart (with status/priority tabs)
- Revenue area chart
- Export dashboard data button
- Additional payment insights

**Permissions:** Only accessible to Managers and Admins

---

## 🏢 Organization Settings

### New Hooks

#### `useOrganization()`
Fetches organization settings.

```typescript
import { useOrganization } from '@/hooks'

const { data: org, isLoading } = useOrganization()
// Returns: Organization with name, logoUrl, settings, etc.
```

#### `useUpdateOrganization()`
Updates organization settings.

```typescript
import { useUpdateOrganization } from '@/hooks'

const updateMutation = useUpdateOrganization()

updateMutation.mutate({
  name: 'New Org Name',
  settings: { timezone: 'America/New_York', currency: 'USD' }
})
```

#### `useUploadOrganizationLogo()`
Uploads organization logo image.

```typescript
import { useUploadOrganizationLogo } from '@/hooks'

const uploadMutation = useUploadOrganizationLogo()

uploadMutation.mutate(logoFile)
```

### Organization Settings Page

Access at `/settings/organization`:

**Features:**
- Organization logo upload
- Organization name editing
- Timezone configuration
- Currency settings
- Organization information display (ID, created date, etc.)

**Permissions:** Only Managers and Admins can edit

---

## 📁 File Management

### New Hooks

#### `useFileUpload()`
Uploads files to the server.

```typescript
import { useFileUpload } from '@/hooks'

const uploadMutation = useFileUpload()

uploadMutation.mutate(file)
// Returns: UploadedFile with _id, filename, url, mimetype, size
```

#### `useDeleteFile()`
Deletes uploaded files.

```typescript
import { useDeleteFile } from '@/hooks'

const deleteMutation = useDeleteFile()

deleteMutation.mutate(fileId)
```

### Usage Example

```tsx
import { useFileUpload, useDeleteFile } from '@/hooks'

function FileUploadComponent() {
  const uploadMutation = useFileUpload()
  const deleteMutation = useDeleteFile()

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {uploadMutation.isPending && <p>Uploading...</p>}
    </div>
  )
}
```

---

## 📥 Data Export

### New Hook

#### `useExportDashboard()`
Exports dashboard data as CSV/Excel.

```typescript
import { useExportDashboard } from '@/hooks'

const exportMutation = useExportDashboard()

// Export all data
exportMutation.mutate()

// Export with filters
exportMutation.mutate({ startDate: '2025-01-01', endDate: '2025-12-31' })
```

**Features:**
- Downloads data as file (CSV/Excel)
- Automatic filename handling
- Success/error toast notifications

### Usage in Component

```tsx
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useExportDashboard } from '@/hooks'

function ExportButton() {
  const exportMutation = useExportDashboard()

  return (
    <Button
      onClick={() => exportMutation.mutate()}
      disabled={exportMutation.isPending}
    >
      <Download className="mr-2 h-4 w-4" />
      {exportMutation.isPending ? 'Exporting...' : 'Export Data'}
    </Button>
  )
}
```

---

## 💳 Enhanced Payment Features

### New Payment Hooks

#### `useDownloadInvoice()`
Downloads invoice PDF for a payment.

```typescript
import { useDownloadInvoice } from '@/hooks/usePayments'

const downloadMutation = useDownloadInvoice()

downloadMutation.mutate(paymentId)
```

#### `useSendInvoiceEmail()`
Sends invoice via email.

```typescript
import { useSendInvoiceEmail } from '@/hooks/usePayments'

const sendMutation = useSendInvoiceEmail()

sendMutation.mutate(paymentId)
```

### Usage in PaymentCard

```tsx
import { useDownloadInvoice, useSendInvoiceEmail } from '@/hooks/usePayments'

function PaymentActions({ paymentId }: { paymentId: string }) {
  const downloadMutation = useDownloadInvoice()
  const sendMutation = useSendInvoiceEmail()

  return (
    <div>
      <Button onClick={() => downloadMutation.mutate(paymentId)}>
        Download Invoice
      </Button>
      <Button onClick={() => sendMutation.mutate(paymentId)}>
        Email Invoice
      </Button>
    </div>
  )
}
```

---

## 🔌 API Endpoints Used

### Dashboard Analytics
- `GET /dashboard/sessions` - Session statistics over time
- `GET /dashboard/goals-category` - Goals by status and priority
- `GET /dashboard/revenue` - Revenue trends
- `GET /payments/stats` - Payment statistics

### Organization Management
- `GET /organization` - Fetch organization settings
- `PATCH /organization` - Update organization settings
- `POST /organization/logo` - Upload organization logo

### File Management
- `POST /upload` - Upload file
- `DELETE /upload/{fileId}` - Delete file

### Data Export
- `GET /exports/dashboard` - Export dashboard data

### Enhanced Payment Features
- `GET /payments/{paymentId}/invoice` - Download invoice PDF
- `POST /payments/{paymentId}/send-invoice` - Email invoice

---

## 🎨 Component Structure

```
src/
├── components/
│   └── charts/
│       ├── SessionsChart.tsx       # Bar chart for sessions
│       ├── GoalsPieChart.tsx       # Pie chart for goals
│       ├── RevenueChart.tsx        # Area chart for revenue
│       └── PaymentStatsCard.tsx    # Payment statistics cards
├── hooks/
│   ├── useAnalytics.ts            # Analytics hooks
│   ├── useOrganization.ts         # Organization hooks
│   ├── useFiles.ts                # File upload hooks
│   ├── useExport.ts               # Export hook
│   └── usePayments.ts             # Enhanced with invoice functions
└── routes/
    └── _authenticated/
        ├── dashboard/
        │   └── analytics.tsx       # Analytics dashboard page
        └── settings/
            └── organization.tsx    # Organization settings page
```

---

## 🚀 Getting Started

### 1. Import Hooks

```typescript
import {
  useSessionsChart,
  useGoalsCategoryChart,
  useRevenueChart,
  usePaymentStats,
  useOrganization,
  useFileUpload,
  useExportDashboard
} from '@/hooks'
```

### 2. Use in Components

```tsx
function MyDashboard() {
  const { data: sessionsData } = useSessionsChart()
  const { data: paymentStats } = usePaymentStats()
  
  return (
    <div>
      {sessionsData && <SessionsChart data={sessionsData} />}
      {paymentStats && <PaymentStatsCard stats={paymentStats} />}
    </div>
  )
}
```

### 3. Navigation

```typescript
// Navigate to analytics dashboard
navigate({ to: '/dashboard/analytics' })

// Navigate to organization settings
navigate({ to: '/settings/organization' })
```

---

## 📝 TypeScript Types

All hooks and components are fully typed. Key interfaces:

```typescript
interface SessionsChartData {
  date: string
  scheduled: number
  completed: number
  cancelled: number
  total: number
}

interface GoalsCategoryData {
  byStatus: {
    not_started: number
    in_progress: number
    completed: number
    blocked: number
  }
  byPriority: {
    low: number
    medium: number
    high: number
  }
}

interface RevenueChartData {
  date: string
  revenue: number
  sessions: number
}

interface PaymentStats {
  totalRevenue: number
  pendingAmount: number
  paidAmount: number
  overdueAmount: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  averagePaymentTime: number
  revenueByMonth: Array<{ month: string; revenue: number }>
  revenueByCoach: Array<{ coachId: string; coachName: string; revenue: number }>
}
```

---

## 🎯 Best Practices

1. **Error Handling**: All hooks include toast notifications for success/error states
2. **Loading States**: Use `isLoading` and `isPending` flags for better UX
3. **Permissions**: Check user role before showing sensitive features
4. **Type Safety**: All functions are fully typed with TypeScript
5. **Caching**: React Query automatically caches API responses

---

## 🔒 Permissions

- **Analytics Dashboard**: Managers, Admins only
- **Organization Settings**: Managers, Admins can edit; others can view
- **File Upload**: All authenticated users
- **Data Export**: Managers, Admins only
- **Invoice Actions**: Based on payment ownership and role

---

## 📚 Dependencies

All features use existing project dependencies:
- `recharts` - For charts
- `@tanstack/react-query` - For data fetching
- `lucide-react` - For icons
- Shadcn UI components - For UI elements

No additional packages needed!
