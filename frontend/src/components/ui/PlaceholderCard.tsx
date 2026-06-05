import type { ReactNode } from 'react'

type PlaceholderCardProps = {
  title: string
  children?: ReactNode
}

export function PlaceholderCard({ title, children }: PlaceholderCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5">
      <h2 className="mb-3 text-sm font-medium text-text-secondary">{title}</h2>
      {children ?? (
        <p className="text-sm text-text-secondary">
          Content will be connected to the API later.
        </p>
      )}
    </div>
  )
}
