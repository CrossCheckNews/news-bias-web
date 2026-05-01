import {
  BarChart3,
  CheckCircle2,
  Clock,
  Flag,
  Loader2,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActivePipeline, useLatestRunDate } from '@/hooks/usePipeline';
import { getLatestRunDate, triggerPipelineCollect } from '@/api/pipeline';
import type { PipelineStep, PipelineStepStatus } from '@/types/pipeline';
import StepDetailModal from './StepDetailModal';
import RunConfirmModal from './RunConfirmModal';
const STATUS_TEXT: Record<PipelineStepStatus, string> = {
  SUCCESS: 'SUCCESS',
  RUNNING: 'RUNNING',
  WAITING: 'WAITING',
  FAILED: 'FAILED',
};

const STATUS_TEXT_COLOR: Record<PipelineStepStatus, string> = {
  SUCCESS: 'text-emerald-600',
  RUNNING: 'text-cyan-600',
  WAITING: 'text-slate-400',
  FAILED: 'text-red-500',
};

function StepIcon({ status }: { status: PipelineStepStatus }) {
  const base =
    'w-10 h-10 rounded-full flex items-center justify-center shadow-sm';
  if (status === 'SUCCESS')
    return (
      <div className={cn(base, 'bg-emerald-500 text-white')}>
        <CheckCircle2 className="w-5 h-5" fill="currentColor" />
      </div>
    );
  if (status === 'RUNNING')
    return (
      <div
        className={cn(
          base,
          'bg-cyan-600 text-white ring-4 ring-cyan-100 animate-pulse',
        )}
      >
        <RefreshCw className="w-5 h-5 animate-spin" />
      </div>
    );
  if (status === 'FAILED')
    return (
      <div className={cn(base, 'bg-red-500 text-white')}>
        <XCircle className="w-5 h-5" fill="currentColor" />
      </div>
    );
  return (
    <div className={cn(base, 'bg-slate-200 text-slate-400')}>
      <Clock className="w-5 h-5" />
    </div>
  );
}

function StepNode({
  step,
  isLastStep,
  onDetails,
}: {
  step: PipelineStep;
  isLastStep: boolean;
  onDetails: () => void;
}) {
  const canViewDetails = !isLastStep && step.status !== 'WAITING';

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
        <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-2">
          {step.detail}
        </p>
      )}
      {canViewDetails && (
        <button
          onClick={onDetails}
          className="mt-2 text-[10px] font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors"
        >
          View Details
        </button>
      )}
    </div>
  );
}

export default function PipelineOrchestration() {
  const queryClient = useQueryClient();
  const latestRunDateQuery = useLatestRunDate();
  const activePipeline = useActivePipeline();
  const [selectedStep, setSelectedStep] = useState<PipelineStep | null>(null);
  const [confirmRunDate, setConfirmRunDate] = useState<string | null>(null);
  const [isCheckingDate, setIsCheckingDate] = useState(false);

  const { mutate: runPipeline, isPending } = useMutation({
    mutationFn: () => triggerPipelineCollect(1),
    onMutate: () => {
      activePipeline.resetForNextRun();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });

  async function handleRunClick() {
    setIsCheckingDate(true);
    try {
      const { runDate, today } = await queryClient.fetchQuery({
        queryKey: ['pipeline', 'latest-run-date'],
        queryFn: getLatestRunDate,
      });
      if (runDate === today) {
        setConfirmRunDate(runDate);
      } else {
        runPipeline();
      }
    } finally {
      setIsCheckingDate(false);
    }
  }

  if (!activePipeline.data) {
    return <div className="h-32 bg-slate-100 rounded animate-pulse" />;
  }

  const { pipelineId, steps } = activePipeline.data;
  const completedCount = steps.filter((s) => s.status === 'SUCCESS').length;
  const progressPct =
    steps.length > 1 ? (completedCount / (steps.length - 1)) * 100 : 0;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            Active Pipeline Orchestration
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 tabular-nums">
              Last run date:{' '}
              {latestRunDateQuery.isPending
                ? '…'
                : (latestRunDateQuery.data?.runDate ?? '—')}
            </span>
            <button
              onClick={handleRunClick}
              disabled={
                isPending || isCheckingDate || !activePipeline.isStreamReady
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cc-slate text-white text-xs font-bold rounded hover:opacity-80 transition-opacity disabled:opacity-40"
              title={
                activePipeline.isStreamReady
                  ? 'Run Pipeline'
                  : 'Connecting pipeline stream'
              }
            >
              {isPending || isCheckingDate ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" fill="currentColor" />
                  Run Pipeline
                </>
              )}
            </button>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded border border-slate-200">
              ID: {pipelineId}
            </span>
          </div>
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
              <StepNode
                key={step.id}
                step={step}
                isLastStep={i === steps.length - 1}
                onDetails={() => setSelectedStep(step)}
              />
            ))}
          </div>
        </div>
      </div>
      <StepDetailModal
        step={selectedStep}
        onClose={() => setSelectedStep(null)}
      />
      {confirmRunDate && (
        <RunConfirmModal
          runDate={confirmRunDate}
          onConfirm={() => {
            activePipeline.resetForNextRun();
            runPipeline();
          }}
          onClose={() => setConfirmRunDate(null)}
        />
      )}
    </>
  );
}
