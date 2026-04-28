import { screen, waitFor } from '@testing-library/react'
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
const mockedCreatePublisher = vi.mocked(publishersApi.createPublisher)
const mockedUpdatePublisher = vi.mocked(publishersApi.updatePublisher)

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

describe('PublisherForm - 신규 등록', () => {
  it('빈 폼을 렌더링한다', () => {
    renderNewForm()

    expect(screen.getByText('언론사 등록')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('예: 더 에디토리얼')).toHaveValue('')
    expect(screen.getByPlaceholderText('https://example.com/feed.xml')).toHaveValue('')
  })

  it('이름과 국가 미입력 시 저장 버튼이 비활성화된다', () => {
    renderNewForm()

    expect(screen.getByRole('button', { name: /저장하기/ })).toBeDisabled()
  })

  it('이름, 국가, RSS URL 모두 입력 시 저장 버튼이 활성화된다', async () => {
    const user = userEvent.setup()
    renderNewForm()

    await user.type(screen.getByPlaceholderText('예: 더 에디토리얼'), '새 언론사')
    await user.selectOptions(screen.getByRole('combobox'), 'US')
    await user.type(screen.getByPlaceholderText('https://example.com/feed.xml'), 'https://rss.example.com/feed')

    expect(screen.getByRole('button', { name: /저장하기/ })).toBeEnabled()
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

  it('저장 성공 시 createPublisher를 호출하고 이전 페이지로 이동한다', async () => {
    mockedCreatePublisher.mockResolvedValue(makePublisher({ id: 99, name: '새 언론사' }))
    const user = userEvent.setup()
    renderNewForm()

    await user.type(screen.getByPlaceholderText('예: 더 에디토리얼'), '새 언론사')
    await user.selectOptions(screen.getByRole('combobox'), 'US')
    await user.type(screen.getByPlaceholderText('https://example.com/feed.xml'), 'https://rss.example.com/feed')
    await user.click(screen.getByRole('button', { name: /저장하기/ }))

    await waitFor(() => {
      expect(mockedCreatePublisher).toHaveBeenCalledWith(
        expect.objectContaining({ name: '새 언론사', country: 'US' }),
      )
    })
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('저장 실패 시 오류 메시지를 표시한다', async () => {
    mockedCreatePublisher.mockRejectedValue(new Error('Server error'))
    const user = userEvent.setup()
    renderNewForm()

    await user.type(screen.getByPlaceholderText('예: 더 에디토리얼'), '새 언론사')
    await user.selectOptions(screen.getByRole('combobox'), 'KR')
    await user.type(screen.getByPlaceholderText('https://example.com/feed.xml'), 'https://rss.example.com/feed')
    await user.click(screen.getByRole('button', { name: /저장하기/ }))

    expect(await screen.findByText('저장 중 오류가 발생했습니다.')).toBeInTheDocument()
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

    expect(await screen.findByText('언론사 수정')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('예: 더 에디토리얼')).toHaveValue('기존 언론사')
  })

  it('수정 저장 시 updatePublisher를 호출한다', async () => {
    const existing = makePublisher({ id: 5, name: '기존 언론사', country: 'US' })
    mockedGetPublisher.mockResolvedValue(existing)
    mockedUpdatePublisher.mockResolvedValue(existing)
    const user = userEvent.setup()

    renderEditForm('5')

    await screen.findByText('언론사 수정')
    await user.click(screen.getByRole('button', { name: /저장하기/ }))

    await waitFor(() => {
      expect(mockedUpdatePublisher).toHaveBeenCalledWith(
        5,
        expect.objectContaining({ name: '기존 언론사' }),
      )
    })
  })

  it('API 오류 시 "언론사를 불러오지 못했습니다." 메시지를 표시한다', async () => {
    mockedGetPublisher.mockRejectedValue(new Error('Not found'))

    renderEditForm('999')

    expect(await screen.findByText('언론사를 불러오지 못했습니다.')).toBeInTheDocument()
  })
})
