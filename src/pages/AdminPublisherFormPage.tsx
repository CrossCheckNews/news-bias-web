import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BookMarked, Info, Save, User } from 'lucide-react';

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

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-neutral-300" />
      <span className="shrink-0 text-xs font-semibold text-neutral-500">
        {label}
      </span>
      <div className="h-px flex-1 bg-neutral-300" />
    </div>
  );
}

function publisherToForm(p: Publisher): PublisherFormData {
  return {
    name: p.name,
    country: p.country,
    politicalLeaning: p.politicalLeaning,
    rssUrl: p.rssUrl ?? '',
  };
}

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
    <div className="min-h-dvh bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-cc-slate">
            <BookMarked className="size-5" />
            <span className="font-bold text-neutral-900">
              Publisher Registry
            </span>
          </div>
          <button type="button" className="text-neutral-500">
            <User className="size-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        {/* Back */}
        <button
          type="button"
          onClick={back}
          className="mt-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-700"
        >
          <ArrowLeft className="size-3.5" />
          Registry Back
        </button>

        {/* Hero */}
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900">
          언론사 등록 및 수정
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          새로운 뉴스 매체를 시스템에 등록하거나 기존 정보를 업데이트합니다.
        </p>

        <div className="mt-7 space-y-6">
          {/* 기본 정보 */}
          <SectionDivider label="기본 정보" />

          <div className="space-y-5">
            <Field label="언론사명">
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="예: 더 에디토리얼"
                className={inputClass}
              />
            </Field>

            <Field label="국가">
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
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  ↓
                </span>
              </div>
            </Field>

          </div>

          {/* 편집 성향 */}
          <SectionDivider label="편집 성향" />

          <Field label="정치 성향">
            <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-neutral-300">
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
                        : 'bg-white text-neutral-500 hover:bg-neutral-50',
                    )}
                  >
                    <span
                      className={cn(
                        'text-base font-bold italic',
                        active ? 'text-white' : 'text-neutral-700',
                      )}
                    >
                      {opt.labelEn}
                    </span>
                    <span className="text-xs">{opt.labelKo}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-neutral-400">
              매체의 전반적인 사설 및 보도 방향을 기반으로 선택하십시오.
            </p>
          </Field>

          {/* 데이터 수집 설정 */}
          <SectionDivider label="데이터 수집 설정" />

          <Field label="RSS URL">
            <div className="flex gap-2">
              <input
                type="url"
                value={form.rssUrl}
                onChange={(e) => set('rssUrl', e.target.value)}
                placeholder="https://example.com/feed.xml"
                className={cn(
                  inputClass,
                  'flex-1',
                  rssValidated && 'border-green-400 ring-1 ring-green-300',
                )}
              />
              <button
                type="button"
                onClick={handleValidateRss}
                className="shrink-0 rounded-lg border border-neutral-300 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                검증
              </button>
            </div>
            {rssValidated && (
              <p className="mt-1 text-xs text-green-600">유효한 URL입니다.</p>
            )}
          </Field>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          {saveMutation.isError && (
            <p className="text-center text-sm text-red-500">
              저장 중 오류가 발생했습니다.
            </p>
          )}
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!canSubmit || saveMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cc-slate py-3.5 text-sm font-semibold text-white hover:bg-cc-slate/90 disabled:opacity-50"
          >
            <Save className="size-4" />
            {saveMutation.isPending ? '저장 중...' : '저장하기'}
          </button>
          <button
            type="button"
            onClick={back}
            className="w-full rounded-xl bg-neutral-100 py-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
          >
            취소
          </button>
        </div>

        {/* Info box */}
        <div className="mt-8 rounded-xl bg-cc-surface-1 p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-cc-slate/10">
            <Info className="size-5 text-cc-slate" />
          </div>
          <h3 className="mt-3 font-semibold italic text-cc-slate">등록 안내</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
            등록된 언론사는 시스템 관리자의 최종 승인 후 대시보드에 노출됩니다.
            RSS 피드는 15분 간격으로 자동 동기화되며, 연결 오류 시 시스템 로그에
            기록됩니다.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-neutral-200 pt-6 text-xs text-neutral-400">
          <p>© 2024 THE EDITORIAL MONOGRAPH. INTERNAL ADMIN USE ONLY.</p>
          <div className="mt-3 flex gap-4">
            <button type="button" className="hover:text-neutral-700">
              DOCUMENTATION
            </button>
            <button type="button" className="hover:text-neutral-700">
              PRIVACY POLICY
            </button>
            <button type="button" className="hover:text-neutral-700">
              SUPPORT
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function AdminPublisherFormPage() {
  const { publisherId } = useParams<{ publisherId?: string }>();
  const isEdit = Boolean(publisherId);
  const navigate = useNavigate();

  const { data: existing, isLoading, isError } = useQuery({
    queryKey: ['publisher', publisherId],
    queryFn: () => getPublisher(Number(publisherId)),
    enabled: isEdit,
  });

  const back = () => navigate(`/admin/${ADMIN_SECRET_PATH}`);

  if (isEdit && isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-neutral-400">
        불러오는 중...
      </div>
    );
  }

  if (isEdit && (isError || !existing)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center text-sm text-neutral-600">
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

  const initialForm = isEdit && existing ? publisherToForm(existing) : EMPTY_FORM;
  const initialRssValidated = Boolean(initialForm.rssUrl);

  return (
    <PublisherFormBody
      key={isEdit ? publisherId : 'new'}
      initialForm={initialForm}
      initialRssValidated={initialRssValidated}
      publisherId={publisherId}
      isEdit={isEdit}
      back={back}
    />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400';
