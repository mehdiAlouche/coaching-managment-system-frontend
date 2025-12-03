import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { useOrganization, useUpdateOrganization, useUploadOrganizationLogo } from '@/hooks/useOrganization'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Upload, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/models'

export const Route = createFileRoute('/_authenticated/settings/organization')({
  component: OrganizationSettingsPage,
})

function OrganizationSettingsPage() {
  const { user } = useAuth()
  const { data: org, isLoading } = useOrganization()
  const updateOrgMutation = useUpdateOrganization()
  const uploadLogoMutation = useUploadOrganizationLogo()
  
  const [name, setName] = useState('')
  const [settings, setSettings] = useState<Record<string, any>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update form when org data loads
  useEffect(() => {
    if (org) {
      setName(org.name || '')
      setSettings(org.settings || {})
    }
  }, [org])

  const handleSave = async () => {
    await updateOrgMutation.mutateAsync({
      name,
      settings,
    })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadLogoMutation.mutateAsync(file)
    }
  }

  // Check permissions
  const canEdit = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Organization Settings</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage your organization's profile and settings
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Organization Logo */}
            <div>
              <Label className="text-base font-semibold">Organization Logo</Label>
              <div className="mt-3 flex items-center gap-4">
                {org?.logoUrl && (
                  <img
                    src={org.logoUrl}
                    alt="Organization logo"
                    className="h-20 w-20 rounded-lg object-cover border border-border"
                  />
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={!canEdit || uploadLogoMutation.isPending}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canEdit || uploadLogoMutation.isPending}
                    variant="outline"
                  >
                    {uploadLogoMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: Square image, at least 200x200px
                  </p>
                </div>
              </div>
            </div>

            {/* Organization Name */}
            <div>
              <Label htmlFor="orgName" className="text-base font-semibold">
                Organization Name
              </Label>
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
                className="mt-2"
                placeholder="Enter organization name"
              />
            </div>

            {/* Additional Settings */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Additional Settings
              </Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone || ''}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    disabled={!canEdit}
                    placeholder="e.g., America/New_York"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency || 'USD'}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    disabled={!canEdit}
                    placeholder="e.g., USD, EUR"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            {canEdit && (
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateOrgMutation.isPending}
                  size="lg"
                >
                  {updateOrgMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>
            )}

            {!canEdit && (
              <p className="text-sm text-muted-foreground italic">
                You don't have permission to edit organization settings.
              </p>
            )}
          </div>
        </Card>

        {/* Organization Info */}
        {org && (
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold mb-4">Organization Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Organization ID:</span>
                <p className="font-mono text-xs mt-1">{org._id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="mt-1">{new Date(org.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <p className="mt-1">{new Date(org.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
