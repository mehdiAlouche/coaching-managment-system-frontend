import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Session, User } from '@/models'
import { UserRole } from '@/models'
import { useAuth } from '@/context/AuthContext'
import { apiClient, endpoints } from '@/services'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface CreateSessionModalProps {
  open: boolean
  existingSessions?: Session[]
  onCreated?: () => void
  onOpenChange: (open: boolean) => void
}

interface SessionFormState {
  coachId: string
  entrepreneurId: string
  scheduledAt: string
  duration: number
  location: string
  videoConferenceUrl: string
  description: string
}

const defaultState: SessionFormState = {
  coachId: '',
  entrepreneurId: '',
  scheduledAt: '',
  duration: 60,
  location: 'Virtual',
  videoConferenceUrl: '',
  description: '',
}

const creationSteps = [
  { id: 1, label: 'Select Coach' },
  { id: 2, label: 'Select Entrepreneur' },
  { id: 3, label: 'Schedule Session' },
  { id: 4, label: 'Review & Confirm' },
] as const

export function CreateSessionModal({ open, onOpenChange, existingSessions = [], onCreated }: CreateSessionModalProps) {
  const { user } = useAuth()
  const { handleError, showSuccess, handleValidationError } = useErrorHandler()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<SessionFormState>({ ...defaultState })
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)
  const [isCheckingConflict, setIsCheckingConflict] = useState(false)
  const [hasConflictApi, setHasConflictApi] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ videoConferenceUrl?: string }>({})

  const organizationId = user?.organizationId ?? ''
  const managerId = user?._id ?? ''

  useEffect(() => {
    if (!open) {
      setStep(1)
      setForm({ ...defaultState })
      setConflictWarning(null)
      setIsCheckingConflict(false)
      setHasConflictApi(false)
      setFieldErrors({})
    }
  }, [open])

  const { data: coaches = [] } = useQuery<User[]>({
    queryKey: ['modal-coaches', organizationId],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.users.list, {
        params: { role: UserRole.COACH, organizationId },
      })
      return Array.isArray(res.data.data) ? (res.data.data as User[]) : []
    },
    enabled: open && !!organizationId,
  })

  const { data: entrepreneurs = [] } = useQuery<User[]>({
    queryKey: ['modal-entrepreneurs', organizationId],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.users.list, {
        params: { role: UserRole.ENTREPRENEUR, organizationId },
      })
      return Array.isArray(res.data.data) ? (res.data.data as User[]) : []
    },
    enabled: open && !!organizationId,
  })

  const createSession = useMutation({
    mutationFn: async (payload: SessionFormState) => {
      const start = new Date(payload.scheduledAt)
      const endTime = new Date(start.getTime() + payload.duration * 60_000)

      const response = await apiClient.post(endpoints.sessions.create, {
        ...payload,
        managerId,
        scheduledAt: start.toISOString(),
        endTime: endTime.toISOString(),
      })

      return response.data
    },
    onSuccess: () => {
      showSuccess('Session scheduled!', 'Invite emails will go out automatically.')
      onOpenChange(false)
      onCreated?.()
    },
    onError: (error) => {
      const validationErrors = handleValidationError(error)
      if (validationErrors) {
        const videoError = validationErrors.find((err) => err.field?.includes('videoConferenceUrl'))
        setFieldErrors((prev) => ({ ...prev, videoConferenceUrl: videoError?.message }))
        return
      }
      handleError(error, { customMessage: 'Unable to create session right now.' })
    },
  })

  const selectedCoach = coaches.find((coach) => coach._id === form.coachId)
  const selectedEntrepreneur = entrepreneurs.find((ent) => ent._id === form.entrepreneurId)

  const timelinePreview = useMemo(() => {
    if (!form.scheduledAt) return { date: null, summary: '' }
    const start = new Date(form.scheduledAt)
    const end = new Date(start.getTime() + form.duration * 60_000)
    return {
      date: start,
      summary: `${format(start, 'MMM d, yyyy')} · ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')} (${form.duration} min)`
    }
  }, [form.duration, form.scheduledAt])

  const hasConflict = useMemo(() => {
    if (!form.coachId || !form.scheduledAt) {
      return { conflict: false, conflicts: [] as Session[] }
    }

    const start = new Date(form.scheduledAt)
    const end = new Date(start.getTime() + form.duration * 60_000)

    const conflicts = existingSessions.filter((session) => {
      const coachId = typeof session.coachId === 'string' ? session.coachId : session.coachId?._id
      if (coachId !== form.coachId) return false
      const otherStart = new Date(session.scheduledAt)
      const otherEnd = new Date(session.endTime)
      return start < otherEnd && end > otherStart
    })

    return { conflict: conflicts.length > 0, conflicts }
  }, [existingSessions, form.coachId, form.duration, form.scheduledAt])

  // Server-side conflict check (debounced)
  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!form.coachId || !form.scheduledAt || !form.duration) {
        setHasConflictApi(false)
        setConflictWarning(null)
        return
      }
      try {
        setIsCheckingConflict(true)
        const start = new Date(form.scheduledAt)
        const payload = {
          coachId: form.coachId,
          scheduledAt: start.toISOString(),
          duration: form.duration,
        }
        const res = await apiClient.post(endpoints.sessions.conflictCheck, payload)
        const api = res.data?.data
        const has = Boolean(api?.hasConflict)
        setHasConflictApi(has)
        if (has && api?.conflictingSession) {
          const ent = api.conflictingSession.entrepreneur
          const who = ent ? `${ent.firstName} ${ent.lastName}` : 'another session'
          const when = api.conflictingSession.scheduledAt ? format(new Date(api.conflictingSession.scheduledAt), 'MMM d, HH:mm') : ''
          setConflictWarning(`Conflict with ${who} at ${when}. Please adjust.`)
          toast({
            title: 'Scheduling conflict',
            description: `Conflict with ${who} at ${when}. Adjust the time or coach.`,
            variant: 'destructive',
          })
        } else if (has) {
          setConflictWarning('Scheduling conflict detected. Please adjust.')
          toast({
            title: 'Scheduling conflict',
            description: 'Scheduling conflict detected. Please adjust.',
            variant: 'destructive',
          })
        } else {
          setConflictWarning(null)
        }
      } catch (_err) {
        setConflictWarning(null)
        setHasConflictApi(false)
      } finally {
        setIsCheckingConflict(false)
      }
    }, 300)

    return () => clearTimeout(handle)
  }, [form.coachId, form.scheduledAt, form.duration])

  const handleNext = () => {
    if (step === 1 && !form.coachId) return
    if (step === 2 && !form.entrepreneurId) return
    if (step === 3) {
      if (!form.scheduledAt) return
      const message = validateVideoUrl(form.videoConferenceUrl)
      if (message) {
        setFieldErrors((prev) => ({ ...prev, videoConferenceUrl: message }))
        return
      }
      setFieldErrors((prev) => ({ ...prev, videoConferenceUrl: undefined }))
    }
    setStep((prev) => Math.min(prev + 1, 4))
  }

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1))

  const handleSubmit = () => {
    if (hasConflict.conflict || hasConflictApi || isCheckingConflict) {
      setConflictWarning('Please resolve scheduling conflicts before saving this session.')
      return
    }
    const message = validateVideoUrl(form.videoConferenceUrl)
    if (message) {
      setFieldErrors((prev) => ({ ...prev, videoConferenceUrl: message }))
      setStep(3)
      return
    }
    setFieldErrors((prev) => ({ ...prev, videoConferenceUrl: undefined }))
    createSession.mutate(form)
  }

  const disabledSubmit = createSession.isPending || hasConflict.conflict || hasConflictApi || isCheckingConflict

  const validateVideoUrl = (value: string) => {
    if (!value) {
      return 'Video conference link is required'
    }
    try {
      const parsed = new URL(value)
      if (!['https:', 'http:'].includes(parsed.protocol)) {
        return 'Meeting link must start with http or https'
      }
      return undefined
    } catch (_err) {
      return 'Enter a valid URL (e.g. https://meet.example.com)'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Coaching Session</DialogTitle>
          <DialogDescription>
            Step {step} of {creationSteps.length} · {creationSteps[step - 1]?.label}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            {creationSteps.map((meta) => {
              const isCurrent = meta.id === step
              const isComplete = meta.id < step
              return (
                <li
                  key={meta.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                      isComplete
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isCurrent
                          ? 'border-primary text-primary'
                          : 'border-border text-muted-foreground'
                    }`}
                  >
                    {meta.id}
                  </span>
                  <span
                    className={`truncate ${
                      isCurrent
                        ? 'text-foreground font-medium'
                        : isComplete
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {meta.label}
                  </span>
                </li>
              )
            })}
          </ol>

          {step === 1 && (
            <section className="space-y-4">
              <Label className="text-sm font-semibold">Coach</Label>
              <Select value={form.coachId} onValueChange={(value) => setForm((prev) => ({ ...prev, coachId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a coach" />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map((coach) => (
                    <SelectItem key={coach._id} value={coach._id}>
                      {coach.firstName} {coach.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCoach?.hourlyRate ? (
                <p className="text-xs text-muted-foreground">Rate: {selectedCoach.hourlyRate.toLocaleString()} MAD / hour</p>
              ) : null}
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <Label className="text-sm font-semibold">Entrepreneur</Label>
              <Select value={form.entrepreneurId} onValueChange={(value) => setForm((prev) => ({ ...prev, entrepreneurId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an entrepreneur" />
                </SelectTrigger>
                <SelectContent>
                  {entrepreneurs.map((ent) => (
                    <SelectItem key={ent._id} value={ent._id}>
                      {ent.firstName} {ent.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>
          )}

          {step === 3 && (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Scheduled Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                />
                {isCheckingConflict && (
                  <p className="text-xs text-muted-foreground">Checking…</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={form.duration}
                  onChange={(e) => setForm((prev) => ({ ...prev, duration: Number(e.target.value) || 60 }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Meeting Type</Label>
                <Input value="Video conference" disabled className="bg-muted/50 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Sessions run exclusively online. Share the meeting link below.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Video Conference URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="https://meet..."
                  value={form.videoConferenceUrl}
                  onChange={(e) => {
                    const nextValue = e.target.value.trim()
                    setForm((prev) => ({ ...prev, videoConferenceUrl: nextValue }))
                    setFieldErrors((prev) => ({ ...prev, videoConferenceUrl: validateVideoUrl(nextValue) }))
                  }}
                  onBlur={(e) => {
                    const message = validateVideoUrl(e.target.value.trim())
                    setFieldErrors((prev) => ({ ...prev, videoConferenceUrl: message }))
                  }}
                  aria-invalid={fieldErrors.videoConferenceUrl ? 'true' : 'false'}
                />
                {fieldErrors.videoConferenceUrl && (
                  <p className="text-xs text-destructive">{fieldErrors.videoConferenceUrl}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notes for agenda (optional)</Label>
                <Input
                  placeholder="Key talking points"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              {conflictWarning && (
                <p className="md:col-span-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  {conflictWarning}
                </p>
              )}
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4 text-sm">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h3 className="text-base font-semibold text-foreground">Session Summary</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Coach</dt>
                    <dd className="font-medium text-foreground">{selectedCoach ? `${selectedCoach.firstName} ${selectedCoach.lastName}` : '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Entrepreneur</dt>
                    <dd className="font-medium text-foreground">{selectedEntrepreneur ? `${selectedEntrepreneur.firstName} ${selectedEntrepreneur.lastName}` : '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Schedule</dt>
                    <dd className="font-medium text-foreground">{timelinePreview.summary || 'Not set'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium text-foreground">Video conference</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Meeting link</dt>
                    <dd className="font-medium text-primary">
                      {form.videoConferenceUrl || 'Not provided'}
                    </dd>
                  </div>
                </dl>
              </div>
              {conflictWarning && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  {conflictWarning}
                </p>
              )}
            </section>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={() => (step === 1 ? onOpenChange(false) : handleBack())}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex items-center gap-2">
            {step < 4 && (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !form.coachId) ||
                  (step === 2 && !form.entrepreneurId) ||
                  (step === 3 && (!form.scheduledAt || !!validateVideoUrl(form.videoConferenceUrl)))
                }
              >
                Next
              </Button>
            )}
            {step === 4 && (
              <Button onClick={handleSubmit} disabled={disabledSubmit}>
                {createSession.isPending ? 'Creating…' : 'Create Session'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
