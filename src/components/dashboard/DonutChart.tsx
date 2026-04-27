import type { DonutSegment } from '@/types/pipeline'

const CIRCUMFERENCE = 2 * Math.PI * 50 // ≈ 314

interface DonutChartProps {
  segments: DonutSegment[]
  centerLabel: string
  centerSub: string
  legend?: Array<{ label: string; color: string; value: number }>
}

export default function DonutChart({ segments, centerLabel, centerSub, legend }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)

  let cumulativeDash = 0
  const arcs = segments.map((seg) => {
    const dash = total > 0 ? (seg.value / total) * CIRCUMFERENCE : 0
    const arc = { ...seg, dash, offset: -cumulativeDash }
    cumulativeDash += dash
    return arc
  })

  return (
    <div className="flex flex-col">
      <div className="flex-1 flex items-center justify-center relative h-36">
        <svg className="w-32 h-32 -rotate-90">
          <circle cx="64" cy="64" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx="64"
              cy="64"
              r="50"
              fill="none"
              stroke={arc.color}
              strokeWidth="12"
              strokeDasharray={`${arc.dash} ${CIRCUMFERENCE}`}
              strokeDashoffset={arc.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-900">{centerLabel}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{centerSub}</span>
        </div>
      </div>
      {legend && (
        <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {legend.map(({ label, color, value }) => (
            <div key={label} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              {label} ({value})
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
