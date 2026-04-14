"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface-elevated rounded-2xl border border-border p-8 text-center">
          <p className="font-mono text-sm text-problem-accent mb-2">
            Something went wrong loading this tool
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="font-mono text-xs text-text-tertiary hover:text-text-primary underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
