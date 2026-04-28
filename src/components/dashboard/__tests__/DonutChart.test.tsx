import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DonutChart from '@/components/dashboard/DonutChart'

describe('DonutChart', () => {
  it('renders center labels and legend values', () => {
    render(
      <DonutChart
        segments={[
          { label: 'SUCCESS', value: 8, color: '#10b981' },
          { label: 'FAILED', value: 2, color: '#ef4444' },
        ]}
        centerLabel="80%"
        centerSub="SUCCESS"
        legend={[
          { label: 'SUCCESS', value: 8, color: '#10b981' },
          { label: 'FAILED', value: 2, color: '#ef4444' },
        ]}
      />,
    )

    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('SUCCESS (8)')).toBeInTheDocument()
    expect(screen.getByText('FAILED (2)')).toBeInTheDocument()
  })
})
