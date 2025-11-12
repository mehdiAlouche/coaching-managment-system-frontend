import { Link, useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../lib/api-client"
import endpoints from "../lib/api-endpoints"
import type { Session } from "../types"
import { useState } from "react"

interface SessionDetailsPageProps {
  id: string
}

export default function SessionDetailsPage({ id }: SessionDetailsPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    data: session,
    isLoading,
    error,
  } = useQuery<Session>({
    queryKey: ["session", id],
    queryFn: async () => {
      if (!id) throw new Error("Session ID is required")
      const response = await apiClient.get(endpoints.sessions.get(id))
      return response.data.data
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
      return response.data.data
    },
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(["session", id], updatedSession)
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
    },
  })

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-gray-600 mt-4">Loading session...</p>
      </div>
    )
  }

  if (error || !session) {
    return <div className="text-center py-12 text-red-600">Failed to load session. Please try again.</div>
  }

  const startDate = new Date(session.startTime)
  const endDate = new Date(session.endTime)
  const durationMs = endDate.getTime() - startDate.getTime()
  const duration = Math.round(durationMs / 60000)
  const isPast = endDate.getTime() < Date.now()

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <Link to="/sessions" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to Sessions
          </Link>
          <div className="flex gap-2">
            {!isPast && session.status === "scheduled" && (
              <>
                <button
                  onClick={() => updateStatusMutation.mutate("completed")}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Mark Complete
                </button>
                <button
                  onClick={() => updateStatusMutation.mutate("cancelled")}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}
            <Link to="/sessions/$id/edit" params={{ id }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Edit
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{session.title}</h1>
              {session.description && <p className="text-gray-600 text-lg">{session.description}</p>}
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                session.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : session.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Session Details</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-lg text-gray-900 mt-1">{session.location}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Date and Time</p>
                  <div className="mt-1 space-y-1">
                    <p className="text-lg text-gray-900">{startDate.toLocaleDateString()}</p>
                    <p className="text-gray-600">
                      {startDate.toLocaleTimeString([], {
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
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-lg text-gray-900 mt-1">{duration} minutes</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Participants</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Coach ID</p>
                  <p className="text-lg text-gray-900 mt-1 font-mono bg-gray-50 px-3 py-2 rounded">{session.coachId}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">entrepreneur ID</p>
                  <p className="text-lg text-gray-900 mt-1 font-mono bg-gray-50 px-3 py-2 rounded">
                    {session.entrepreneurId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {session.notes && (
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{session.notes}</p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 text-sm text-gray-500">
            <p>
              Created on {new Date(session.createdAt).toLocaleDateString()} at{" "}
              {new Date(session.createdAt).toLocaleTimeString()}
            </p>
            <p>
              Last updated {new Date(session.updatedAt).toLocaleDateString()} at{" "}
              {new Date(session.updatedAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-8">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
              >
                Delete Session
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="font-semibold text-red-900 mb-3">Are you sure? This cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => deleteSessionMutation.mutate()}
                    disabled={deleteSessionMutation.isPending}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    {deleteSessionMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
