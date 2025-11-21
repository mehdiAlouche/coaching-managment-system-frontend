import { Outlet } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'
import { Toaster } from '../components/ui/toaster'

export function RootLayout() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
            <span className="text-white font-bold text-2xl">CM</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}

