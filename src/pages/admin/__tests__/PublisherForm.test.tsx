import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders, makePublisher } from '@/test/utils'
import PublisherForm from '@/pages/admin/PublisherForm'
import * as publishersApi from '@/api/publishers'

vi.mock('@/api/publishers')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockNavigate = vi.fn()
const mockedGetPublisher = vi.mocked(publishersApi.getPublisher)

function renderNewForm() {
  return renderWithProviders(
    <Routes>
      <Route path="/publishers/new" element={<PublisherForm />} />
    </Routes>,
    { route: '/publishers/new' },
  )
}

function renderEditForm(id = '5') {
  return renderWithProviders(
    <Routes>
      <Route path="/publishers/:publisherId/edit" element={<PublisherForm />} />
    </Routes>,
    { route: `/publishers/${id}/edit` },
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PublisherForm - 신규', () => {
  it('빈 폼을 렌더링한다', () => {
    renderNewForm()

    expect(screen.getByText('언론사 정보')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('예: 더 에디토리얼')).toHaveValue('')
    expect(screen.getByPlaceholderText('https://example.com/feed.xml')).toHaveValue('')
  })

  it('유효한 RSS URL 입력 후 검증 버튼 클릭 시 성공 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    renderNewForm()

    await user.type(screen.getByPlaceholderText('https://example.com/feed.xml'), 'https://rss.example.com/feed')
    await user.click(screen.getByRole('button', { name: '검증' }))

    expect(screen.getByText('유효한 URL입니다.')).toBeInTheDocument()
  })

  it('잘못된 RSS URL 입력 후 검증 버튼 클릭 시 alert가 호출된다', async () => {
    const user = userEvent.setup()
    renderNewForm()

    await user.type(screen.getByPlaceholderText('https://example.com/feed.xml'), 'not-a-valid-url')
    await user.click(screen.getByRole('button', { name: '검증' }))

    expect(window.alert).toHaveBeenCalledWith('올바른 URL 형식이 아닙니다.')
  })
})

describe('PublisherForm - 수정', () => {
  it('수정 모드에서 로딩 중 "불러오는 중..." 텍스트를 표시한다', () => {
    mockedGetPublisher.mockReturnValue(new Promise(() => {}))

    renderEditForm()

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument()
  })

  it('기존 데이터를 폼에 미리 채운다', async () => {
    const existing = makePublisher({ id: 5, name: '기존 언론사', country: 'KR', politicalLeaning: 'LEFT' })
    mockedGetPublisher.mockResolvedValue(existing)

    renderEditForm('5')

    expect(await screen.findByText('언론사 상세')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('예: 더 에디토리얼')).toHaveValue('기존 언론사')
  })

  it('API 오류 시 "언론사를 불러오지 못했습니다." 메시지를 표시한다', async () => {
    mockedGetPublisher.mockRejectedValue(new Error('Not found'))

    renderEditForm('999')

    expect(await screen.findByText('언론사를 불러오지 못했습니다.')).toBeInTheDocument()
  })
})
