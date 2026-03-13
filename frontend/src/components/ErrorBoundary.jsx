import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep a readable error trail in the console for quick debugging.
    console.error('UI render error:', error, info);
  }

  render() {
    const { hasError, error } = this.state;
    if (!hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)]">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
            Something went wrong
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-3">We hit a rendering error.</h1>
          <p className="text-sm text-gray-600 mt-2">
            Check the console for the exact stack trace. If needed, refresh once and try again.
          </p>
          {error?.message && (
            <pre className="mt-4 text-xs whitespace-pre-wrap rounded-xl bg-gray-50 border border-gray-200 p-3 text-gray-700">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
