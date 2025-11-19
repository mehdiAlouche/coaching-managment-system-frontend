import { Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/layout/Sidebar'
import { ModeToggle } from '@/components/theme/mode-toggle'

interface AuthenticatedLayoutProps {
  onLogout: () => void
}

export function AuthenticatedLayout({ onLogout }: AuthenticatedLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
