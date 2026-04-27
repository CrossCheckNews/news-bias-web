import { BarChart3, CheckCircle2, Clock, Flag, RefreshCw, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PipelineStep, PipelineStepStatus } from '@/types/pipeline'

const STATUS_TEXT: Record<PipelineStepStatus, string> = {
  SUCCESS: 'SUCCESS',
  RUNNING: 'RUNNING',
  WAITING: 'WAITING',
  FAILED: 'FAILED',
}

const STATUS_TEXT_COLOR: Record<PipelineStepStatus, string> = {
  SUCCESS: 'text-emerald-600',
  RUNNING: 'text-cyan-600',
  WAITING: 'text-slate-400',
  FAILED: 'text-red-500',
}

function StepIcon({ status }: { status: PipelineStepStatus }) {
  const base = 'w-10 h-10 rounded-full flex items-center justify-center shadow-sm'
  if (status === 'SUCCESS')
    return (
      <div className={cn(base, 'bg-emerald-500 text-white')}>
        <CheckCircle2 className="w-5 h-5" fill="currentColor" />
      </div>
    )
  if (status === 'RUNNING')
    return (
      <div className={cn(base, 'bg-cyan-600 text-white ring-4 ring-cyan-100 animate-pulse')}>
        <RefreshCw className="w-5 h-5 animate-spin" />
      </div>
    )
  if (status === 'FAILED')
    return (
      <div className={cn(base, 'bg-red-500 text-white')}>
        <XCircle className="w-5 h-5" fill="currentColor" />
      </div>
    )
  return (
    <div className={cn(base, 'bg-slate-200 text-slate-400')}>
      <Clock className="w-5 h-5" />
    </div>
  )
}

function StepNode({ step, isLastStep }: { step: PipelineStep; isLastStep: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      {isLastStep ? (
        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shadow-sm">
          <Flag className="w-5 h-5" />
        </div>
      ) : (
        <StepIcon status={step.status} />
      )}
      <p
        className={cn(
          'font-bold text-xs uppercase tracking-tight mt-3',
          step.status === 'WAITING' ? 'text-slate-400' : 'text-slate-700',
        )}
      >
        {step.label}
      </p>
      <p className={cn('text-xs mt-1', STATUS_TEXT_COLOR[step.status])}>
        {STATUS_TEXT[step.status]}
      </p>
      {step.detail && (
        <p className="text-[10px] text-slate-400 mt-1 italic">{step.detail}</p>
      )}
    </div>
  )
}

interface PipelineOrchestrationProps {
  pipelineId: string
  steps: PipelineStep[]
}

export default function PipelineOrchestration({ pipelineId, steps }: PipelineOrchestrationProps) {
  const completedCount = steps.filter((s) => s.status === 'SUCCESS').length
  const progressPct = steps.length > 1 ? (completedCount / (steps.length - 1)) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          Active Pipeline Orchestration
        </h2>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded border border-slate-200">
          ID: {pipelineId}
        </span>
      </div>
      <div className="relative">
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
          {steps.map((step, i) => (
            <StepNode key={step.id} step={step} isLastStep={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
