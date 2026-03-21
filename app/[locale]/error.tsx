"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error logging can be added here if needed
  }, [error]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4 max-w-md px-6 text-center">
        <Icon icon="solar:danger-triangle-linear" className="text-6xl text-red-500" />
        <h2 className="text-xl font-bold text-white">Erro ao carregar aplicação</h2>
        <p className="text-neutral-400">
          {error.message || "Ocorreu um erro inesperado ao carregar a aplicação"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>
    </div>
  );
}
