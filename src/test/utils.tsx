import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  routerProps?: MemoryRouterProps
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', routerProps, ...renderOptions }: ProviderOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]} {...routerProps}>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export function makeTopicSummary(overrides = {}) {
  return {
    id: 1,
    aiSummaryTitle: '테스트 토픽 제목',
    summary: { CNN: 'CNN 관점', 'Fox News': 'Fox 관점' },
    aiSummary: 'AI 요약 텍스트입니다.',
    status: 'ACTIVE' as const,
    startDate: '2026-04-28',
    articleCount: 5,
    leaningDistribution: { CONSERVATIVE: 3, PROGRESSIVE: 2 },
    countryDistribution: { US: 5 },
    ...overrides,
  }
}

export function makeTopicPage(overrides = {}) {
  return {
    content: [makeTopicSummary()],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 20,
    last: true,
    first: true,
    ...overrides,
  }
}

export function makePublisher(overrides = {}) {
  return {
    id: 1,
    name: '테스트 언론사',
    country: 'US',
    politicalLeaning: 'CENTER' as const,
    rssUrl: 'https://example.com/feed.xml',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}
