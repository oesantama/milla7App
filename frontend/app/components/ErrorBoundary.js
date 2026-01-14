'use client';

import React from 'react';

// Small ErrorBoundary to avoid whole-app crashes from render-time exceptions
// and to give us a clear stack trace in the console when something goes wrong.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log full stack so we can inspect the problematic module in the devtools
    // The consumer (Layout) will still see the error in console for traceability.
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{ padding: '12px', background: '#ffecec', borderRadius: 6 }}
        >
          <strong>Error en el menú:</strong>
          <div style={{ marginTop: 8, color: '#b00020' }}>
            Ocurrió un error al renderizar el menú. Revisa la consola para más
            detalles.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
