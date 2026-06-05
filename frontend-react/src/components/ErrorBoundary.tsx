import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: string; }

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: "" };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error: error.message };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
                    <div className="bg-gray-900 border border-red-800 rounded-2xl p-8 max-w-md text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-red-400 text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-gray-400 text-sm mb-6">{this.state.error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
