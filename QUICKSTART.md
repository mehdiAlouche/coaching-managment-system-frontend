# Quick Start Guide - New Features

## 🚀 Using the New Analytics Features

### View Analytics Dashboard
Simply navigate to the analytics page:

```typescript
// In your navigation or component
<Link to="/dashboard/analytics">View Analytics</Link>
```

Or access directly in browser:
```
http://localhost:5173/dashboard/analytics
```

### Add Charts to Any Page

```tsx
import { useSessionsChart, usePaymentStats } from '@/hooks'
import { SessionsChart, PaymentStatsCard } from '@/components/charts'

function MyCustomDashboard() {
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

### Export Dashboard Data

```tsx
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useExportDashboard } from '@/hooks'

function ExportButton() {
  const exportMutation = useExportDashboard()

  return (
    <Button onClick={() => exportMutation.mutate(undefined)}>
      <Download className="mr-2 h-4 w-4" />
      Export Data
    </Button>
  )
}
```

---

## 🏢 Managing Organization Settings

### Navigate to Settings
```
http://localhost:5173/settings/organization
```

Or add to your navigation:
```tsx
<Link to="/settings/organization">Organization Settings</Link>
```

### Programmatic Updates

```tsx
import { useUpdateOrganization, useUploadOrganizationLogo } from '@/hooks'

function OrganizationManager() {
  const updateMutation = useUpdateOrganization()
  const uploadMutation = useUploadOrganizationLogo()

  const handleUpdate = () => {
    updateMutation.mutate({
      name: 'New Org Name',
      settings: { currency: 'USD', timezone: 'America/New_York' }
    })
  }

  const handleLogoUpload = (file: File) => {
    uploadMutation.mutate(file)
  }

  return (
    <div>
      <button onClick={handleUpdate}>Update Settings</button>
      <input type="file" onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) handleLogoUpload(file)
      }} />
    </div>
  )
}
```

---

## 📁 File Upload

### Simple File Upload Component

```tsx
import { useFileUpload } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

function FileUploader() {
  const uploadMutation = useFileUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        className="hidden"
      />
      <Button onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
      </Button>
    </div>
  )
}
```

---

## 💳 Payment Invoice Actions

### Download Invoice

```tsx
import { useDownloadInvoice } from '@/hooks/usePayments'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

function InvoiceDownloadButton({ paymentId }: { paymentId: string }) {
  const downloadMutation = useDownloadInvoice()

  return (
    <Button onClick={() => downloadMutation.mutate(paymentId)}>
      <Download className="mr-2 h-4 w-4" />
      Download Invoice
    </Button>
  )
}
```

### Email Invoice

```tsx
import { useSendInvoiceEmail } from '@/hooks/usePayments'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

function EmailInvoiceButton({ paymentId }: { paymentId: string }) {
  const sendMutation = useSendInvoiceEmail()

  return (
    <Button onClick={() => sendMutation.mutate(paymentId)}>
      <Mail className="mr-2 h-4 w-4" />
      Email Invoice
    </Button>
  )
}
```

---

## 📊 All Available Charts

### Sessions Chart
```tsx
import { useSessionsChart } from '@/hooks'
import { SessionsChart } from '@/components/charts/SessionsChart'

function MyPage() {
  const { data } = useSessionsChart()
  return data ? <SessionsChart data={data} title="My Sessions" /> : null
}
```

### Goals Pie Chart
```tsx
import { useGoalsCategoryChart } from '@/hooks'
import { GoalsPieChart } from '@/components/charts/GoalsPieChart'

function MyPage() {
  const { data } = useGoalsCategoryChart()
  return data ? <GoalsPieChart data={data} title="Goals Breakdown" /> : null
}
```

### Revenue Chart
```tsx
import { useRevenueChart } from '@/hooks'
import { RevenueChart } from '@/components/charts/RevenueChart'

function MyPage() {
  const { data } = useRevenueChart()
  return data ? <RevenueChart data={data} currency="USD" /> : null
}
```

### Payment Stats Card
```tsx
import { usePaymentStats } from '@/hooks'
import { PaymentStatsCard } from '@/components/charts/PaymentStatsCard'

function MyPage() {
  const { data } = usePaymentStats()
  return data ? <PaymentStatsCard stats={data} currency="USD" /> : null
}
```

---

## 🎯 Common Patterns

### Loading States
```tsx
const { data, isLoading, error } = useSessionsChart()

if (isLoading) return <Loader2 className="animate-spin" />
if (error) return <p>Error loading data</p>
return <SessionsChart data={data} />
```

### Error Handling
All hooks include automatic toast notifications:
- ✅ Success toasts for successful operations
- ❌ Error toasts with detailed messages
- No manual error handling needed!

### Refetching Data
```tsx
const { data, refetch } = useSessionsChart()

// Manually refetch
<Button onClick={() => refetch()}>Refresh</Button>
```

---

## 🔐 Permissions Check

```tsx
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/models'

function ProtectedFeature() {
  const { user } = useAuth()
  
  const canViewAnalytics = user?.role === UserRole.MANAGER || 
                           user?.role === UserRole.ADMIN

  if (!canViewAnalytics) {
    return <p>Access denied</p>
  }

  return <AnalyticsDashboard />
}
```

---

## 📱 Responsive Design

All components are fully responsive:
- Charts adapt to container width
- Cards stack on mobile
- Optimized for all screen sizes

---

## 🎨 Customization

### Custom Chart Titles
```tsx
<SessionsChart data={data} title="Custom Title" />
<GoalsPieChart data={data} title="My Goals" />
<RevenueChart data={data} title="Revenue Trends" />
```

### Custom Currency
```tsx
<RevenueChart data={data} currency="EUR" />
<PaymentStatsCard stats={data} currency="GBP" />
```

---

## 🧪 Testing Tips

1. **Check with empty data**: All components handle empty/null data gracefully
2. **Test loading states**: All hooks expose `isLoading` flag
3. **Test error states**: All hooks expose `error` object
4. **Test permissions**: Components respect role-based access
5. **Test responsiveness**: Charts work on all screen sizes

---

## 🚦 Development Server

Start the dev server and test:
```bash
npm run dev
```

Then visit:
- http://localhost:5173/dashboard/analytics
- http://localhost:5173/settings/organization

---

## 📞 Need Help?

See `FEATURES.md` for comprehensive documentation with all TypeScript types and detailed API information.

---

**Happy coding! 🎉**
