import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Nimisave Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('nimisave_wallet');
    localStorage.removeItem('nimisave_goals');
    localStorage.removeItem('nimisave_transactions');
    localStorage.removeItem('nimisave_prompts');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-neutral-900 p-8 rounded-3xl flex flex-col gap-5 text-center">
            <h2 className="text-xl font-light">Application Recovery</h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              An unexpected display issue occurred with cached data. Click below to refresh and load fresh state.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-neutral-100 text-neutral-950 text-xs rounded-xl cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 bg-neutral-800 text-neutral-300 text-xs rounded-xl cursor-pointer hover:bg-neutral-750 transition-colors"
              >
                Reset Stored Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

