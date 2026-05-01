import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getActivePipeline,
  getArticlesByPublisher,
  getDashboardChartData,
  getLatestRunDate,
  getPipelineHistory,
  getPipelineMetrics,
  mapStreamStatus,
  subscribePipelineStream,
} from '@/api/pipeline'
import type { ActivePipeline, PipelineStep, PipelineStepEvent } from '@/types/pipeline'

export function usePipelineMetrics() {
  return useQuery({
    queryKey: ['pipeline', 'metrics'],
    queryFn: getPipelineMetrics,
    refetchInterval: 30_000,
  })
}

export function useLatestRunDate() {
  return useQuery({
    queryKey: ['pipeline', 'latest-run-date'],
    queryFn: getLatestRunDate,
    staleTime: 60_000,
  })
}

export function useActivePipeline() {
  const [data, setData] = useState<ActivePipeline>()
  const [isStreamReady, setIsStreamReady] = useState(false)
  const [activeRunId, setActiveRunId] = useState<number | null>(null)
  const activeRunIdRef = useRef<number | null>(null)

  const resetForNextRun = useCallback(() => {
    activeRunIdRef.current = null
    setActiveRunId(null)
    getActivePipeline().then(setData)
  }, [])

  useEffect(() => {
    let mounted = true

    getActivePipeline().then((initial) => {
      if (mounted) setData(initial)
    })

    const close = subscribePipelineStream(
      (event) => {
        if (event.pipelineRunId == null) return

        const currentRunId = activeRunIdRef.current
        if (currentRunId != null && currentRunId !== event.pipelineRunId) {
          return
        }

        if (currentRunId == null) {
          activeRunIdRef.current = event.pipelineRunId
          setActiveRunId(event.pipelineRunId)
        }

        setData((current) => {
          if (!current) return current

          const activeIndex = stepIndex(event.step)
          const detail = [event.targetName, event.message, event.errorMessage]
            .filter(Boolean)
            .join(' · ')
          const newEvent: PipelineStepEvent = {
            status: event.status,
            message: event.message,
            progress: event.progress,
            targetName: event.targetName,
            errorMessage: event.errorMessage,
            emittedAt: event.emittedAt,
          }
          const steps = current.steps.map((step, index): PipelineStep => {
            if (index < activeIndex) return { ...step, status: 'SUCCESS' }
            if (index > activeIndex) return step
            return {
              ...step,
              status: mapStreamStatus(event.status),
              detail,
              events: [...(step.events ?? []), newEvent],
            }
          })

          return { ...current, pipelineId: `RUN #${event.pipelineRunId}`, steps }
        })
      },
      () => setIsStreamReady(true),
      () => setIsStreamReady(false),
    )

    return () => {
      mounted = false
      setIsStreamReady(false)
      close()
    }
  }, [])

  return { data, isLoading: !data, isStreamReady, activeRunId, resetForNextRun }
}

export function usePipelineHistory() {
  return useQuery({
    queryKey: ['pipeline', 'history'],
    queryFn: getPipelineHistory,
    refetchInterval: 30_000,
  })
}

export function useArticlesByPublisher() {
  return useQuery({
    queryKey: ['pipeline', 'articles-by-publisher'],
    queryFn: getArticlesByPublisher,
    refetchInterval: 60_000,
  })
}

export function useDashboardChartData() {
  return useQuery({
    queryKey: ['pipeline', 'chart-data'],
    queryFn: getDashboardChartData,
    refetchInterval: 60_000,
  })
}

function stepIndex(step: string) {
  const order = ['RSS_COLLECT', 'ARTICLE_SAVE', 'TOPIC_CLUSTERING', 'AI_SUMMARY', 'COMPLETED']
  return Math.max(order.indexOf(step), 0)
}
