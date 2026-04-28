import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PipelineHistoryTable from '@/components/dashboard/PipelineHistoryTable'
import type { PipelineHistoryRow } from '@/types/pipeline'

describe('PipelineHistoryTable', () => {
  it('renders run id, target, processed count, and error type', () => {
    const rows: PipelineHistoryRow[] = [{
      id: 1,
      pipelineRunId: 42,
      executedAt: '2026-04-28 10:00',
      step: 'RSS_COLLECT',
      status: 'FAILED',
      processed: 3,
      targetName: 'Fox News',
      errorType: 'RSS_TIMEOUT',
      errorMessage: 'Connection timeout',
      message: 'RSS 피드 수집 실패: Connection timeout',
    }]

    render(<PipelineHistoryTable rows={rows} />)

    expect(screen.getByText('#42')).toBeInTheDocument()
    expect(screen.getByText('RSS_COLLECT')).toBeInTheDocument()
    expect(screen.getByText('Fox News')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText('FAILED')).toBeInTheDocument()
    expect(screen.getByText('RSS_TIMEOUT')).toBeInTheDocument()
  })
})
