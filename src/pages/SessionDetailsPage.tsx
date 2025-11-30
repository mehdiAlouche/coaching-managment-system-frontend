import { Link, useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, endpoints } from "../services"
import type { Session } from "../models"
import { UserRole } from "../models"
import { useState } from "react"
import { useErrorHandler } from "../hooks/useErrorHandler"
import { useAuth } from "../context/AuthContext"

interface SessionDetailsPageProps {
  id: string
}

export default function SessionDetailsPage({ id }: SessionDetailsPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { handleError, showSuccess } = useErrorHandler()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { user } = useAuth()

  const {
    data: session,
    isLoading,
    error,
  } = useQuery<Session>({
    queryKey: ["session", id],
    queryFn: async () => {
      if (!id) throw new Error("Session ID is required")
      const response = await apiClient.get(endpoints.sessions.get(id))
      return response.data
    },
    enabled: !!id,
  })

  const deleteSessionMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Session ID is required")
      await apiClient.delete(endpoints.sessions.delete(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
      navigate({ to: "/sessions" })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!id) throw new Error("Session ID is required")
      const response = await apiClient.patch(endpoints.sessions.update(id), { status })
      return response.data
    },
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(["session", id], updatedSession)
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
      const statusText = updatedSession.status.charAt(0).toUpperCase() + updatedSession.status.slice(1).replace("_", " ")
      showSuccess(`Session status updated to ${statusText}`)
    },
    onError: (error) => {
      handleError(error)
    },
  })

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-muted-foreground mt-4">Loading session...</p>
      </div>
    )
  }

  if (error || !session) {
    return <div className="text-center py-12 text-destructive">Failed to load session. Please try again.</div>
  }

  const scheduledDate = new Date(session.scheduledAt)
  const endDate = new Date(session.endTime)
  const isPast = endDate.getTime() < Date.now()
  const canManageSession = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <Link to="/sessions" className="text-primary hover:text-primary/80 font-medium">
            ← Back to Sessions
          </Link>
          {canManageSession && (
            <div className="flex gap-2">
              {!isPast && session.status === "scheduled" && (
                <>
                  <button
                    onClick={() => updateStatusMutation.mutate("completed")}
                    disabled={updateStatusMutation.isPending}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate("cancelled")}
                    disabled={updateStatusMutation.isPending}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
              <Link to="/sessions/$id/edit" params={{ id }} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                Edit
              </Link>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
          {/* Header */}
          <div className="bg-primary px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary-foreground mb-2">Coaching Session</h1>
                <p className="text-primary-foreground/80">Session ID: {session._id}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${session.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : session.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : session.status === "no_show"
                        ? "bg-orange-100 text-orange-800"
                        : session.status === "rescheduled"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                  }`}
              >
                {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Session Details */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Session Details</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Scheduled Date & Time</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-lg text-foreground font-semibold">{scheduledDate.toLocaleDateString()}</p>
                      <p className="text-muted-foreground">
                        {scheduledDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {endDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="text-lg text-foreground mt-1">{session.duration} minutes</p>
                  </div>

                  {session.location && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p className="text-lg text-foreground mt-1">{session.location}</p>
                    </div>
                  )}

                  {session.videoConferenceUrl && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Video Conference</p>
                      <a 
                        href={session.videoConferenceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lg text-primary hover:text-primary/80 mt-1 inline-block break-all"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Participants</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Coach</p>
                    <p className="text-sm text-foreground mt-1 font-mono bg-muted px-3 py-2 rounded break-all">
                      {typeof session.coachId === 'string' ? session.coachId : `${session.coachId.firstName} ${session.coachId.lastName}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entrepreneur</p>
                    <div className="mt-1 bg-muted px-3 py-2 rounded">
                      <p className="text-lg text-foreground font-semibold">
                        {session.entrepreneur.firstName} {session.entrepreneur.lastName}
                      </p>
                      {session.entrepreneur.startupName && (
                        <p className="text-sm text-muted-foreground mt-1">{session.entrepreneur.startupName}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">{session.entrepreneur.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Manager</p>
                    <div className="mt-1 bg-muted px-3 py-2 rounded">
                      <p className="text-lg text-foreground font-semibold">
                        {session.manager.firstName} {session.manager.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{session.manager.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agenda Items */}
            {session.agendaItems && session.agendaItems.length > 0 && (
              <div className="border-t border-border pt-8 mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Agenda</h3>
                <div className="space-y-4">
                  {session.agendaItems.map((item, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <span className="text-sm text-muted-foreground">{item.duration} min</span>
                      </div>
                      {item.description && <p className="text-muted-foreground text-sm">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {session.notes && Object.keys(session.notes.actionItems).length > 0 && (
              <div className="border-t border-border pt-8 mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Notes</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-foreground whitespace-pre-wrap font-sans text-sm">
                    {JSON.stringify(session.notes.actionItems, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Delete Section */}
            {canManageSession && (
              <div className="border-t border-border pt-6 mt-8">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg font-medium"
                  >
                    Delete Session
                  </button>
                ) : (
                  <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                    <p className="font-semibold text-destructive mb-3">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => deleteSessionMutation.mutate()}
                        disabled={deleteSessionMutation.isPending}
                        className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg disabled:opacity-50"
                      >
                        {deleteSessionMutation.isPending ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
