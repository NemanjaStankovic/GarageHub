import type { ServiceStatus } from '../../types/vehicleService.ts'

const statusConfig: Record<
  ServiceStatus,
  { label: string; className: string }
> = {
  Requested: {
    label: 'Requested',
    className: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  },
  InService: {
    label: 'In service',
    className: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',
  },
  Completed: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-red-500/15 text-red-400 ring-red-500/30',
  },
}

type StatusBadgeProps = {
  status: ServiceStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-surface-muted text-text-secondary ring-border',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  )
}
