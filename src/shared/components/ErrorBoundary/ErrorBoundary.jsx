import { Component } from 'react'
import './ErrorBoundary.scss'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <p className="error-boundary__message">Something went wrong.</p>
          <p className="error-boundary__detail">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
