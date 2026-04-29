import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info)
  }

  private retry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="min-h-dvh bg-slate-50 px-6 py-10 text-slate-900">
        <section className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-xl flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-500">
            Application Error
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            Something went wrong
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            The page could not be rendered. Try again, or return to the main news feed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={this.retry}
              className="inline-flex items-center gap-2 rounded bg-cc-slate px-4 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center rounded border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Go Home
            </a>
          </div>
        </section>
      </main>
    )
  }
}
