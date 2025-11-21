import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboardRoute } from '../../lib/dashboard-routes'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useErrorHandler } from '../../hooks/useErrorHandler'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = Route.useNavigate()
  const { handleError, showSuccess } = useErrorHandler()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const redirectedRef = useRef(false)

  // Redirect away if already authenticated (avoid loop & beforeLoad throttle warning)
  useEffect(() => {
    if (!redirectedRef.current && isAuthenticated && user) {
      redirectedRef.current = true
      navigate({ to: getDashboardRoute(user.role), replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const loggedInUser = await login(email, password)
      const displayName = `${loggedInUser.firstName || ''} ${loggedInUser.lastName || ''}`.trim() || loggedInUser.email
      showSuccess('Welcome back!', `Logged in as ${displayName}`)
      navigate({ to: getDashboardRoute(loggedInUser.role), replace: true })
    } catch (err) {
      handleError(err, { customMessage: 'Invalid email or password. Please check your credentials and try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-2xl">CM</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3">Welcome Back</h1>
          <p className="text-base text-muted-foreground">Sign in to your coaching management account</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/auth/register" className="font-semibold text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
