import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  async handleReset() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (error) {
      console.error('Failed to reset cache:', error);
    } finally {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6" data-testid="app-error-boundary">
          <div className="max-w-xl w-full bg-gray-900/70 border border-red-700 rounded-2xl p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">App failed to load</h1>
            <p className="text-gray-300 mb-4">
              This is usually caused by a cached update or a temporary network issue.
              Use the button below to clear the app cache and reload.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-300 bg-black/40 p-3 rounded mb-4 overflow-auto" data-testid="app-error-details">
                {String(this.state.error)}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
              data-testid="app-error-reset-btn"
            >
              Clear Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
