import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';

import {
  createPublisher,
  getPublisher,
  updatePublisher,
  type PublisherFormData,
} from '@/api/publishers';
import { cn } from '@/lib/utils';
import type { PoliticalLeaning, Publisher } from '@/types';

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;

const COUNTRY_OPTIONS = [
  { label: '영국', value: 'GB' },
  { label: '미국', value: 'US' },
  { label: '대한민국', value: 'KR' },
  { label: '일본', value: 'JP' },
];

const LEANING_OPTIONS: {
  value: PoliticalLeaning;
  labelEn: string;
  labelKo: string;
}[] = [
  { value: 'LEFT', labelEn: 'LEFT', labelKo: '좌편향' },
  { value: 'CENTER', labelEn: 'CENTER', labelKo: '중도' },
  { value: 'RIGHT', labelEn: 'RIGHT', labelKo: '우편향' },
];

const EMPTY_FORM: PublisherFormData = {
  name: '',
  country: '',
  politicalLeaning: 'CENTER',
  rssUrl: '',
};

function publisherToForm(p: Publisher): PublisherFormData {
  return {
    name: p.name,
    country: p.country,
    politicalLeaning: p.politicalLeaning,
    rssUrl: p.rssUrl ?? '',
  };
}

// ─── Form body ────────────────────────────────────────────────────────────────

function PublisherFormBody({
  initialForm,
  initialRssValidated,
  publisherId,
  isEdit,
  back,
}: {
  initialForm: PublisherFormData;
  initialRssValidated: boolean;
  publisherId: string | undefined;
  isEdit: boolean;
  back: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<PublisherFormData>(initialForm);
  const [rssValidated, setRssValidated] = useState(initialRssValidated);

  const set = <K extends keyof PublisherFormData>(
    field: K,
    value: PublisherFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'rssUrl') setRssValidated(false);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      isEdit
        ? updatePublisher(Number(publisherId), form)
        : createPublisher(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['publishers'] });
      back();
    },
  });

  const handleValidateRss = () => {
    try {
      new URL(form.rssUrl);
      setRssValidated(true);
    } catch {
      setRssValidated(false);
      alert('올바른 URL 형식이 아닙니다.');
    }
  };

  const canSubmit =
    Boolean(form.name.trim()) &&
    Boolean(form.country) &&
    Boolean(form.rssUrl.trim());

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Form card */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {/* 기본 정보 */}
          <div className="p-6 space-y-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              기본 정보
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)]">
              <Field label="언론사명" className="min-w-0">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="예: 더 에디토리얼"
                  className={inputClass}
                />
              </Field>
              <Field label="국가" className="min-w-0">
                <div className="relative">
                  <select
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                    className={cn(inputClass, 'appearance-none pr-9')}
                  >
                    <option value="">국가를 선택하세요</option>
                    {COUNTRY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ▾
                  </span>
                </div>
              </Field>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="p-6 space-y-4">
            <Field label="정치 성향">
              <div className="grid grid-cols-3 rounded-lg border border-slate-200 overflow-hidden">
                {LEANING_OPTIONS.map((opt) => {
                  const active = form.politicalLeaning === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('politicalLeaning', opt.value)}
                      className={cn(
                        'flex flex-col items-center gap-1 py-4 text-center transition-colors',
                        active
                          ? 'bg-cc-slate text-white'
                          : 'bg-white text-slate-500 hover:bg-slate-50',
                      )}
                    >
                      <span
                        className={cn(
                          'text-base font-bold italic',
                          active ? 'text-white' : 'text-slate-700',
                        )}
                      >
                        {opt.labelEn}
                      </span>
                      <span className="text-xs">{opt.labelKo}</span>
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <div className="h-px bg-slate-100" />
          <div className="p-6 space-y-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              데이터 수집 설정
            </p>
            <Field label="RSS URL">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.rssUrl}
                  onChange={(e) => set('rssUrl', e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className={cn(
                    inputClass,
                    'flex-1 min-w-0',
                    rssValidated &&
                      'border-emerald-400 ring-1 ring-emerald-300',
                  )}
                />
                <button
                  type="button"
                  onClick={handleValidateRss}
                  className="shrink-0 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  검증
                </button>
              </div>
              {rssValidated && (
                <p className="mt-1 text-xs text-emerald-600">
                  유효한 URL입니다.
                </p>
              )}
            </Field>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            {saveMutation.isError ? (
              <p className="text-sm text-red-500">
                저장 중 오류가 발생했습니다.
              </p>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={back}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={!canSubmit || saveMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-cc-slate px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublisherForm() {
  const { publisherId } = useParams<{ publisherId?: string }>();
  const isEdit = Boolean(publisherId);
  const navigate = useNavigate();

  const {
    data: existing,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['publisher', publisherId],
    queryFn: () => getPublisher(Number(publisherId)),
    enabled: isEdit,
  });

  const back = () => navigate(`/admin/${ADMIN_SECRET_PATH}/publishers`);

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-400">
        불러오는 중...
      </div>
    );
  }

  if (isEdit && (isError || !existing)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-sm text-slate-600">
        <p>언론사를 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={back}
          className="text-cc-slate underline underline-offset-2"
        >
          목록으로
        </button>
      </div>
    );
  }

  const initialForm =
    isEdit && existing ? publisherToForm(existing) : EMPTY_FORM;
  const initialRssValidated = Boolean(initialForm.rssUrl);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <FormPageHeader
        title={isEdit ? '언론사 수정' : '언론사 등록'}
        description="언론사 기본 정보와 RSS 수집 설정을 관리합니다."
        onBack={back}
      />
      <PublisherFormBody
        key={isEdit ? publisherId : 'new'}
        initialForm={initialForm}
        initialRssValidated={initialRssValidated}
        publisherId={publisherId}
        isEdit={isEdit}
        back={back}
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FormPageHeader({
  title,
  description,
  onBack,
}: {
  title: string;
  description?: string;
  onBack: () => void;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="목록으로 돌아가기"
          className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400';
