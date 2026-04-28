import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PipelineOrchestration from '@/components/dashboard/PipelineOrchestration'
import type { PipelineStep } from '@/types/pipeline'

describe('PipelineOrchestration', () => {
  it('renders each pipeline step with status and detail', () => {
    const steps: PipelineStep[] = [
      { id: 'rss', label: 'RSS Collect', status: 'SUCCESS', detail: 'RSS 완료' },
      { id: 'save', label: 'Article Save', status: 'RUNNING', detail: '기사 저장 중' },
      { id: 'cluster', label: 'Topic Cluster', status: 'WAITING' },
      { id: 'ai', label: 'AI Summary', status: 'WAITING' },
      { id: 'done', label: 'Completed', status: 'WAITING' },
    ]

    render(<PipelineOrchestration pipelineId="RUN #42" steps={steps} />)

    expect(screen.getByText('ID: RUN #42')).toBeInTheDocument()
    expect(screen.getByText('RSS Collect')).toBeInTheDocument()
    expect(screen.getByText('Article Save')).toBeInTheDocument()
    expect(screen.getByText('기사 저장 중')).toBeInTheDocument()
    expect(screen.getByText('RUNNING')).toBeInTheDocument()
  })
})
