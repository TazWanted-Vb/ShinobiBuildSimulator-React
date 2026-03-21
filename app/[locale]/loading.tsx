import { Icon } from "@iconify/react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <Icon icon="solar:loader-circle-linear" className="text-6xl text-orange-500 animate-spin" />
        <p className="text-neutral-400 text-lg">Carregando ninjas...</p>
        <p className="text-neutral-600 text-sm">Isso pode levar alguns segundos</p>
      </div>
    </div>
  );
}
