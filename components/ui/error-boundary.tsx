"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Icon } from "@iconify/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * Captura erros JavaScript em qualquer componente filho e exibe uma UI de fallback
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error logging can be added here if needed
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4 max-w-md px-6 text-center">
            <Icon icon="solar:danger-triangle-linear" className="text-6xl text-red-500" />
            <h2 className="text-xl font-bold text-white">Ops! Algo deu errado</h2>
            <p className="text-neutral-400">
              {this.state.error?.message || "Ocorreu um erro inesperado"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
