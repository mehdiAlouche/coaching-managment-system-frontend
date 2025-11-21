import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, endpoints } from "../services"
import type { Session } from "../models"
import { useErrorHandler } from "../hooks/useErrorHandler"

interface EditSessionPageProps {
  id: string
}

export default function EditSessionPage({ id }: EditSessionPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { handleError, showSuccess } = useErrorHandler()

  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ["session", id],
    queryFn: async () => {
      if (!id) throw new Error("Session ID is required")
      const response = await apiClient.get(endpoints.sessions.get(id))
      return response.data
    },
    enabled: !!id,
  })

  const [formData, setFormData] = useState({
    scheduledAt: "",
    duration: 60,
    location: "",
    videoConferenceUrl: "",
    description: "",
    agendaItems: [] as Array<{ title: string; description: string; duration: number }>,
  })

  // Initialize form data when session loads
  useEffect(() => {
    if (session) {
      setFormData({
        scheduledAt: session.scheduledAt ? new Date(session.scheduledAt).toISOString().slice(0, 16) : "",
        duration: session.duration || 60,
        location: session.location || "",
        videoConferenceUrl: session.videoConferenceUrl || "",
        description: (session as any).description || "",
        agendaItems: (session.agendaItems || []).map((item) => ({
          title: item.title || "",
          description: item.description || "",
          duration: item.duration ?? 0,
        })),
      })
    }
  }, [session])

  const updateSessionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!id) throw new Error("Session ID is required")
      if (!session) throw new Error("Session data not loaded")
      const scheduledDate = new Date(data.scheduledAt)

      // Build full update payload per API (PUT)
      const coachId = typeof (session as any).coachId === 'object'
        ? (session as any).coachId?._id
        : (session as any).coachId
      const entrepreneurId = (session as any).entrepreneur?._id
      const managerId = (session as any).manager?._id

      const payload: any = {
        coachId,
        entrepreneurId,
        managerId,
        scheduledAt: scheduledDate.toISOString(),
        duration: data.duration,
        status: (session as any).status || 'scheduled',
        location: data.location,
        videoConferenceUrl: data.videoConferenceUrl,
      }

      // Include agendaItems if present/edited
      if (Array.isArray(data.agendaItems)) {
        payload.agendaItems = data.agendaItems
      }

      // Include description if backend supports it (kept for compatibility)
      if (data.description !== undefined) {
        payload.description = data.description
      }

      const response = await apiClient.put(endpoints.sessions.update(id), payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] })
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
      showSuccess("Session updated successfully!")
      navigate({ to: "/sessions/$id", params: { id } })
    },
    onError: (error) => {
      handleError(error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSessionMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    })
  }

  // Agenda item handlers
  const handleAgendaChange = (idx: number, field: string, value: string | number) => {
    const updated = formData.agendaItems.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    )
    setFormData({ ...formData, agendaItems: updated })
  }

  const addAgendaItem = () => {
    setFormData({
      ...formData,
      agendaItems: [...formData.agendaItems, { title: "", description: "", duration: 0 }],
    })
  }

  const removeAgendaItem = (idx: number) => {
    setFormData({
      ...formData,
      agendaItems: formData.agendaItems.filter((_, i) => i !== idx),
    })
  }

  if (isLoading)
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground mt-4">Loading session...</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/sessions/$id"
          params={{ id }}
          className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 mb-8"
        >
          ← Back to Session
        </Link>

        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-8">Edit Session</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Scheduled At *</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Duration (minutes) *</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Session location"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Video Conference URL</label>
              <input
                type="text"
                name="videoConferenceUrl"
                value={formData.videoConferenceUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Session description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Agenda Items</label>
              <div className="space-y-4">
                {formData.agendaItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => handleAgendaChange(idx, "title", e.target.value)}
                      placeholder="Title"
                      className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => handleAgendaChange(idx, "description", e.target.value)}
                      placeholder="Description"
                      className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="number"
                      value={item.duration}
                      onChange={e => handleAgendaChange(idx, "duration", Number(e.target.value))}
                      placeholder="Duration (min)"
                      min={0}
                      className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeAgendaItem(idx)}
                      className="ml-2 text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAgendaItem}
                  className="mt-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg"
                >
                  + Add Agenda Item
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={updateSessionMutation.isPending}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-2.5 px-4 rounded-lg transition"
              >
                {updateSessionMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/sessions/$id", params: { id } })}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-2.5 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
