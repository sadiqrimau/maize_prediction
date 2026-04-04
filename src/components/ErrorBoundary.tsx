import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Optional label shown in the error card to identify which page failed */
  pageName?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const msg = error instanceof Error ? error.message : String(error);
    return { hasError: true, errorMessage: msg };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { pageName = 'This page' } = this.props;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-card overflow-hidden">
          {/* Red header strip */}
          <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{pageName} failed to load</p>
              <p className="text-red-100 text-xs mt-0.5">An unexpected error occurred</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Something went wrong while rendering this page. This can happen when the API server
              takes too long to respond or returns unexpected data.
            </p>

            {this.state.errorMessage && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-xs font-mono text-gray-500 break-all">
                  {this.state.errorMessage}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-forest text-white rounded-xl text-sm font-semibold
                           hover:bg-forest-dark active:scale-[0.98] transition-all duration-150"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium
                           hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
