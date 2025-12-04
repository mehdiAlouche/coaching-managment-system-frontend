import type { ReactNode } from 'react'

interface AdminSectionLayoutProps {
  title: string
  description?: string
  children?: ReactNode
}

export function AdminSectionLayout({ title, description, children }: AdminSectionLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </header>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {children ?? (
            <p className="text-sm text-muted-foreground">
              This section is coming soon. Use the filters and bulk actions above to explore platform data.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
