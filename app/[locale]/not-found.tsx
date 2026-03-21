import Link from "next/link";
import { Icon } from "@iconify/react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4 max-w-md px-6 text-center">
        <Icon icon="solar:confounded-square-linear" className="text-6xl text-neutral-500" />
        <h2 className="text-xl font-bold text-white">Página não encontrada</h2>
        <p className="text-neutral-400">
          A página que você está procurando não existe.
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
