import { useQuery } from "@tanstack/react-query"
import { apiClient, endpoints } from "../services"
import type { User } from "../models"
import { Link } from "@tanstack/react-router"

export default function ProfilePage() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.auth.me)
      // some APIs wrap data under data
      return res.data?.data || res.data
    },
  })

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-muted-foreground mt-4">Loading profile...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Unable to load profile. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <Link to="/" className="text-primary hover:text-primary/80 font-medium">Home</Link>
        </div>

        <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-lg font-semibold">Account</h2>
            <p className="text-sm text-muted-foreground">Basic information about your account</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-medium text-foreground">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-medium text-foreground break-all">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="text-lg font-medium capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="text-lg font-medium text-foreground break-all">{user.organizationId}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-lg font-medium text-foreground">{user.phone}</p>
              </div>
            )}
            {user.timezone && (
              <div>
                <p className="text-sm text-muted-foreground">Timezone</p>
                <p className="text-lg font-medium text-foreground">{user.timezone}</p>
              </div>
            )}
            {user.hourlyRate !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p className="text-lg font-medium text-foreground">{user.hourlyRate?.toLocaleString()} MAD / hour</p>
              </div>
            )}
            {user.startupName && (
              <div>
                <p className="text-sm text-muted-foreground">Startup</p>
                <p className="text-lg font-medium text-foreground">{user.startupName}</p>
              </div>
            )}
          </div>

          <div className="px-6 py-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm ${user.isActive ? 'border-green-300 text-green-700 bg-green-50' : 'border-red-300 text-red-700 bg-red-50'}`}>
                <span className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-lg font-medium text-foreground">{new Date(user.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="text-lg font-medium text-foreground">{new Date(user.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
