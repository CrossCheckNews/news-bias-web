import { cn } from '@/lib/utils'
import type { PipelineRunStatus } from '@/types/pipeline'

const STATUS_CONFIG: Record<
  PipelineRunStatus,
  { label: string; classes: string; dotClass: string }
> = {
  SUCCESS: {
    label: 'SUCCESS',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dotClass: 'bg-emerald-500',
  },
  FAILED: {
    label: 'FAILED',
    classes: 'bg-red-50 text-red-700 border-red-100',
    dotClass: 'bg-red-500',
  },
  PARTIAL_FAILED: {
    label: 'PARTIAL',
    classes: 'bg-orange-50 text-orange-700 border-orange-100',
    dotClass: 'bg-orange-500',
  },
  RUNNING: {
    label: 'RUNNING',
    classes: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    dotClass: 'bg-cyan-500',
  },
}

export default function StatusBadge({ status }: { status: PipelineRunStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
        config.classes,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  )
}
