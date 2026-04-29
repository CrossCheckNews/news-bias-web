import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import NotFound from '@/pages/NotFound'

describe('NotFound', () => {
  it('renders a 404 message and a link back to the news feed', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )

    expect(screen.getByText('404 Not Found')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '페이지를 찾을 수 없습니다.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to news/i })).toHaveAttribute('href', '/')
  })
})
