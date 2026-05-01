import { useState } from 'react'
import { X } from 'lucide-react'

import type { PublisherFormData } from '@/api/publishers'
import type { PoliticalLeaning, Publisher } from '@/types'

const LEANING_OPTIONS = [
  { value: 'LEFT' as const, label: '좌편향 (LEFT)' },
  { value: 'CENTER' as const, label: '중도 (CENTER)' },
  { value: 'RIGHT' as const, label: '우편향 (RIGHT)' },
]

const EMPTY_FORM: PublisherFormData = {
  name: '',
  country: '',
  politicalLeaning: 'CENTER',
  rssUrl: '',
}

function toForm(p: Publisher): PublisherFormData {
  return {
    name: p.name,
    country: p.country,
    politicalLeaning: p.politicalLeaning,
    rssUrl: p.rssUrl ?? '',
  }
}

interface Props {
  open: boolean
  initial?: Publisher | null
  onClose: () => void
  onSubmit: (data: PublisherFormData) => Promise<void>
}

export function PublisherFormModal({ open, initial, onClose, onSubmit }: Props) {
  if (!open) return null
  return <PublisherFormModalInner initial={initial} onClose={onClose} onSubmit={onSubmit} />
}

function PublisherFormModalInner({ initial, onClose, onSubmit }: Omit<Props, 'open'>) {
  const [form, setForm] = useState<PublisherFormData>(() => initial ? toForm(initial) : EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof PublisherFormData>(
    field: K,
    value: PublisherFormData[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
      onClose()
    } catch {
      setError('저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="font-bold text-neutral-900">
            {initial ? '언론사 수정' : '언론사 추가'}
          </h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <Field label="언론사명" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="The Guardian"
              required
              className={inputClass}
            />
          </Field>

          <Field label="국가 (ISO)" required>
            <input
              type="text"
              value={form.country}
              onChange={(e) => set('country', e.target.value.toUpperCase())}
              placeholder="KR"
              maxLength={2}
              required
              className={inputClass}
            />
          </Field>

          <Field label="성향" required>
            <select
              value={form.politicalLeaning}
              onChange={(e) => set('politicalLeaning', e.target.value as PoliticalLeaning)}
              className={inputClass}
            >
              {LEANING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="RSS URL" required>
            <input
              type="url"
              value={form.rssUrl}
              onChange={(e) => set('rssUrl', e.target.value)}
              placeholder="https://example.com/feed.xml"
              required
              className={inputClass}
            />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-cc-slate py-2.5 text-sm font-semibold text-white hover:bg-cc-slate/90 disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-white'
