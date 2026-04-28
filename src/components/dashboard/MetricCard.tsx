import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  badge?: ReactNode
  subValue?: string
}

export default function MetricCard({ label, value, badge, subValue }: MetricCardProps) {
  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-slate-900 leading-none">{value}</h3>
        {badge}
      </div>
      {subValue && (
        <p className="text-lg font-bold text-slate-400 mt-1">{subValue}</p>
      )}
    </div>
  )
}
