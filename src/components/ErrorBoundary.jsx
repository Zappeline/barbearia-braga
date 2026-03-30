import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4 text-center">
          <div>
            <p className="text-error font-bold mb-2">Algo correu mal.</p>
            <p className="text-outline text-sm mb-6">{this.state.error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-bold"
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
