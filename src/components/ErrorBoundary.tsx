"use client";

import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
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
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center bg-background rounded-xl">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Something went wrong
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                            {this.state.error?.message || "An unexpected error occurred."}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
