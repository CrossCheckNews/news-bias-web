import { X, CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineStep, PipelineStepStatus } from '@/types/pipeline';

const STATUS_COLOR: Record<PipelineStepStatus, string> = {
  SUCCESS: 'text-emerald-600 bg-emerald-50',
  RUNNING: 'text-cyan-600 bg-cyan-50',
  WAITING: 'text-slate-500 bg-slate-100',
  FAILED: 'text-red-600 bg-red-50',
};

function EventStatusDot({ status }: { status: 'RUNNING' | 'SUCCESS' | 'FAILED' }) {
  if (status === 'SUCCESS') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
  if (status === 'FAILED') return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
  return <RefreshCw className="w-3.5 h-3.5 text-cyan-500 shrink-0 animate-spin" />;
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

interface Props {
  step: PipelineStep | null;
  onClose: () => void;
}

export default function StepDetailModal({ step, onClose }: Props) {
  if (!step) return null;

  const hasEvents = step.events && step.events.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              {step.label}
            </h3>
            <span
              className={cn(
                'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                STATUS_COLOR[step.status],
              )}
            >
              {step.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[480px] overflow-y-auto">
          {hasEvents ? (
            <div className="space-y-2">
              {step.events!.map((ev, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="mt-0.5">
                    <EventStatusDot status={ev.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {ev.targetName && (
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {ev.targetName}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 break-words">{ev.message}</p>
                    {ev.errorMessage && (
                      <p className="text-xs text-red-500 mt-1 break-words">{ev.errorMessage}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(ev.emittedAt)}
                      </span>
                      <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            ev.status === 'FAILED' ? 'bg-red-400' : 'bg-emerald-400',
                          )}
                          style={{ width: `${ev.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {ev.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : step.detail ? (
            <p className="text-sm text-slate-600">{step.detail}</p>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-8">
              No details available for this step.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-1.5 rounded border border-slate-200 hover:border-slate-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
