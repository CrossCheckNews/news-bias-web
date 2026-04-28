import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/utils'
import Login from '@/pages/admin/Login'
import * as authApi from '@/api/auth'

vi.mock('@/api/auth')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockNavigate = vi.fn()
const mockedLogin = vi.mocked(authApi.login)

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

describe('Login 페이지', () => {
  it('아이디, 비밀번호 입력 필드와 제출 버튼을 렌더링한다', () => {
    renderWithProviders(<Login />)

    expect(screen.getByLabelText('아이디')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('입력값이 없으면 제출 버튼이 비활성화된다', () => {
    renderWithProviders(<Login />)

    expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled()
  })

  it('아이디와 비밀번호를 입력하면 제출 버튼이 활성화된다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('아이디'), 'admin')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')

    expect(screen.getByRole('button', { name: '로그인' })).toBeEnabled()
  })

  it('로그인 실패 시 한국어 에러 메시지를 표시한다', async () => {
    mockedLogin.mockRejectedValue(new Error('Unauthorized'))
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('아이디'), 'admin')
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(await screen.findByText('아이디 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument()
  })

  it('로그인 성공 시 대시보드로 이동한다', async () => {
    mockedLogin.mockResolvedValue({ token: 'mock-token', tokenType: 'Bearer', expiresIn: 3600 })
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('아이디'), 'admin')
    await user.type(screen.getByLabelText('비밀번호'), 'correct-pass')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/admin/test-secret/dashboard',
        { replace: true },
      )
    })
  })

  it('로그인 중 버튼 텍스트가 "로그인 중..."으로 바뀐다', async () => {
    mockedLogin.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('아이디'), 'admin')
    await user.type(screen.getByLabelText('비밀번호'), 'password')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(screen.getByText('로그인 중...')).toBeInTheDocument()
  })
})
