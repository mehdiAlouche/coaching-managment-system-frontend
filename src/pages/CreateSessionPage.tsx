import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { apiClient, endpoints } from "../services"
import { useAuth } from "../context/AuthContext"
import { useErrorHandler } from "../hooks/useErrorHandler"
import type { User } from "../models"

export default function CreateSessionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { handleError, showSuccess } = useErrorHandler()
  const [formData, setFormData] = useState({
    coachId: "",
    entrepreneurId: "",
    managerId: user?._id || "",
    scheduledAt: "",
    duration: 60,
    agendaItems: [
      { title: "", description: "", duration: 0 }
    ],
    location: "",
    videoConferenceUrl: "",
    description: "",
  })
  const [error, setError] = useState("")

  // Fetch coaches and entrepreneurs for the same org
  const orgId = user?.organizationId || ""
  
    const { data: coaches = [], isLoading: loadingCoaches } = useQuery<User[]>({
      queryKey: ["users", "coaches", orgId],
      queryFn: async () => {
        const res = await apiClient.get(endpoints.users.list, {
          params: { role: "coach", organizationId: orgId }
        })
        return Array.isArray(res.data.data) ? (res.data.data as User[]) : []
      },
      enabled: !!orgId,
    })

    const { data: entrepreneurs = [], isLoading: loadingEntrepreneurs } = useQuery<User[]>({
      queryKey: ["users", "entrepreneurs", orgId],
      queryFn: async () => {
        const res = await apiClient.get(endpoints.users.list, {
          params: { role: "entrepreneur", organizationId: orgId }
        })
        return Array.isArray(res.data.data) ? (res.data.data as User[]) : []
      },
      enabled: !!orgId,
    })
 
  // Set manager automatically when user changes
  useEffect(() => {
    if (user && user._id && formData.managerId !== user._id) {
      setFormData(f => ({ ...f, managerId: user._id }))
    }
  }, [user])

  const createSessionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const scheduledDate = new Date(data.scheduledAt)
      const endDate = new Date(scheduledDate.getTime() + data.duration * 60000)
      const payload = {
        ...data,
        scheduledAt: scheduledDate.toISOString(),
        endTime: endDate.toISOString(),
      }
      const response = await apiClient.post(endpoints.sessions.create, payload)
      return response.data
    },
    onSuccess: (session) => {
      showSuccess("Session created successfully!")
      if (session?._id) {
        navigate({ to: "/sessions/$id", params: { id: session._id } })
      } else {
        navigate({ to: "/sessions" })
      }
    },
    onError: (error) => {
      handleError(error)
      setError("Failed to create session")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createSessionMutation.mutate(formData)
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/sessions" className="text-primary hover:text-primary/80">
            ← Back to Sessions
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-lg shadow-md p-8 border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-8">Create Session</h1>

          {error && <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Coach *</label>
                <select
                  name="coachId"
                  value={formData.coachId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loadingCoaches}
                >
                  <option value="">Select coach</option>
                  {(coaches ?? []).map((coach) => (
                    <option key={coach._id} value={coach._id}>
                      {coach.firstName} {coach.lastName} 
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Entrepreneur *</label>
                <select
                  name="entrepreneurId"
                  value={formData.entrepreneurId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loadingEntrepreneurs}
                >
                  <option value="">Select entrepreneur</option>
                  {(entrepreneurs ?? []).map((ent) => (
                    <option key={ent._id} value={ent._id}>
                      {ent.firstName} {ent.lastName}
                    </option>
                  ))}
                </select>
              </div>
              {/* Manager ID is set automatically, no input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Session location"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Scheduled At *</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Duration (minutes) *</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Video Conference URL</label>
              <input
                type="text"
                name="videoConferenceUrl"
                value={formData.videoConferenceUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Session description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Agenda Items</label>
              <div className="space-y-4">
                {formData.agendaItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => handleAgendaChange(idx, "title", e.target.value)}
                      placeholder="Title"
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => handleAgendaChange(idx, "description", e.target.value)}
                      placeholder="Description"
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="number"
                      value={item.duration}
                      onChange={e => handleAgendaChange(idx, "duration", Number(e.target.value))}
                      placeholder="Duration (min)"
                      min={0}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                  className="mt-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
                >
                  + Add Agenda Item
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={createSessionMutation.isPending}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium py-2 px-4 rounded-lg transition"
              >
                {createSessionMutation.isPending ? "Creating..." : "Create Session"}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/sessions" })}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2 px-4 rounded-lg transition"
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
