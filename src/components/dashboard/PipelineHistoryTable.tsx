import { ExternalLink } from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { PipelineHistoryRow } from '@/types/pipeline'

export default function PipelineHistoryTable({ rows }: { rows: PipelineHistoryRow[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Recent Pipeline History</h2>
        <button className="text-slate-600 text-xs font-bold hover:underline flex items-center gap-1">
          View Full Logs
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Executed At', 'Run', 'Step', 'Target', 'Status', 'Processed', 'Message'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-700">
                  {row.executedAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                  #{row.pipelineRunId}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-slate-700">
                    {row.step}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  {row.targetName ?? '-'}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 font-bold font-mono text-sm text-slate-900">
                  {String(row.processed).padStart(2, '0')}
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  <div>{row.message}</div>
                  {row.errorType && (
                    <div className="mt-1 font-mono text-[10px] font-bold text-red-500">
                      {row.errorType}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
