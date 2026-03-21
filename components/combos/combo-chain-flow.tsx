"use client";

import { memo, Fragment } from "react";
import { Icon } from "@iconify/react";
import { ComboChain as ComboChainType } from "@/lib/types";
import { ComboStepCard } from "./combo-step-card";

interface ComboChainFlowProps {
  chain: ComboChainType;
}

// Memoized arrow component
const ComboArrow = memo(() => {
  return (
    <div className="shrink-0 flex items-center justify-center text-slate-400 text-xl sm:text-xl lg:text-2xl">
      <Icon icon="solar:alt-arrow-right-linear" />
    </div>
  );
});

ComboArrow.displayName = 'ComboArrow';

// Main combo chain flow component
export const ComboChainFlow = memo(({ chain }: ComboChainFlowProps) => {
  return (
    <div className="w-full relative">
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 pt-2 px-2 scroll-smooth custom-scrollbar snap-x snap-mandatory">
        {chain.steps.map((step, idx) => (
          <Fragment key={`${chain.starter.id}-${chain.steps.length}-${step.ninja.id}-${step.action}-${step.skillId}-${idx}`}>
            {/* Combo Step Card (with ninja + skill inside) */}
            <div className="snap-start shrink-0">
              <ComboStepCard step={step} stepNumber={idx + 1} />
            </div>

            {/* Arrow (except after last step) */}
            {idx < chain.steps.length - 1 && (
              <div className="snap-start shrink-0">
                <ComboArrow />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Scroll indicator for desktop */}
      {chain.steps.length > 3 && (
        <div className="absolute bottom-2 right-2 text-slate-600 text-xs flex items-center gap-1 pointer-events-none hidden sm:flex">
          <Icon icon="solar:swipe-horizontal-linear" className="text-sm" />
          <span className="text-[10px]">Scroll to see all</span>
        </div>
      )}
    </div>
  );
});

ComboChainFlow.displayName = 'ComboChainFlow';
