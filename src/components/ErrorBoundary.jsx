import { Component } from 'react'
import './ErrorBoundary.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="error-boundary" role="alert">
        <h2 className="error-boundary__title">Algo deu errado</h2>
        <p className="error-boundary__message">
          {this.state.error?.message ?? 'Erro desconhecido'}
        </p>
        <button
          type="button"
          className="error-boundary__btn"
          onClick={() => this.setState({ hasError: false, error: null })}
        >
          Tentar novamente
        </button>
      </div>
    )
  }
}
