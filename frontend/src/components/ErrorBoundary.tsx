import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught runtime error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card rounded-xl border-2 border-destructive shadow-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>
                        <h1 className="text-xl font-bold font-display text-foreground mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-sm text-muted-foreground mb-6">
                            A critical error occurred while rendering the application interface.
                        </p>

                        <div className="bg-destructive/5 rounded p-3 mb-6 text-left overflow-auto max-h-32 text-xs font-mono text-destructive">
                            {this.state.error?.message || "Unknown rendering exception"}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="neo-button-primary w-full flex items-center justify-center gap-2 py-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
