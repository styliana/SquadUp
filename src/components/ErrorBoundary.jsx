import React from 'react';
import { AlertTriangle, RefreshCw, Home, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Zaktualizuj stan, aby następny render pokazał zastępcze UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Logowanie błędu (w prawdziwej apce wysłałbyś to np. do Sentry/LogRocket)
    console.error("🔴 CRITICAL ERROR CAUGHT BY BOUNDARY:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Próba "miękkiego" resetu - czyści błąd i próbuje przerysować dzieci
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Jeśli używasz np. React Query, tutaj czyściłbyś cache
    window.location.reload(); // W wersji "bezpiecznej" robimy hard reload
  };

  copyErrorToClipboard = () => {
    const text = `Error: ${this.state.error?.toString()}\n\nStack: ${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(text);
    toast.success("Error details copied to clipboard");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="bg-surface border border-red-500/20 max-w-lg w-full rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Tło ozdobne */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
            
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">System Failure</h1>
            <p className="text-textMuted mb-8 leading-relaxed">
              The application encountered a critical error and engaged safety protocols. 
              Please try reloading the system.
            </p>

            {/* Sekcja techniczna (widoczna np. tylko dla developerów lub po rozwinięciu) */}
            <div className="bg-black/40 rounded-xl p-4 mb-8 text-left border border-white/5 relative group">
              <button 
                onClick={this.copyErrorToClipboard}
                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Copy error details"
              >
                <Copy size={14} />
              </button>
              <p className="text-xs font-bold text-red-400 mb-1 font-mono">Error Trace:</p>
              <code className="text-xs text-gray-300 font-mono break-all line-clamp-4">
                {this.state.error?.toString()}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/20 active:scale-[0.98]"
              >
                <RefreshCw size={18} />
                Restart System
              </button>
              
              <a 
                href="/" 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors"
              >
                <Home size={18} />
                Return to Base
              </a>
            </div>

          </div>
          
          <div className="mt-8 text-xs text-gray-600">
            Error Code: 0xCRITICAL_RENDER_FAIL
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;