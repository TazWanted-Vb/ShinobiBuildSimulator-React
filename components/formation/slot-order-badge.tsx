import { memo } from "react";

interface SlotOrderBadgeProps {
  order: number;
}

export const SlotOrderBadge = memo(function SlotOrderBadge({ order }: SlotOrderBadgeProps) {
  return (
    <div className="absolute bottom-[180px] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-30">
      <span className="bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded">
        {order}
      </span>
    </div>
  );
}, (prevProps, nextProps) => {
  // Só re-renderiza se o número mudou
  return prevProps.order === nextProps.order;
});
