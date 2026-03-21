"use client";

import React, { memo } from "react";
import type { ComboChain as ComboChainType, ComboStep } from "@/lib/types";
import { Icon } from "@iconify/react";
import { SkillPopover } from "./skill-popover";
import { getSkillImageUrl } from "@/lib/image-urls";

type ComboLayout = "horizontal" | "vertical";

interface ComboChainProps {
  chain: ComboChainType;
  layout?: ComboLayout;
  showHeader?: boolean;
}

interface ComboStepProps {
  step: ComboStep;
  stepNumber?: number;
  totalSteps?: number;
  layout?: "card" | "compact";
  showTrigger?: boolean;
}

const ComboStepCard = ({ step, stepNumber, totalSteps, layout = "card" }: ComboStepProps) => {
  if (layout === "compact") {
    return (
      <div className="relative w-[150px] h-[90px] pr-[10px]">
        <div className="absolute inset-0 -z-10 rounded bg-neutral-800 border border-neutral-600/50" />
        <div className="flex items-center justify-center gap-2 h-full px-1.5">
          <div className="w-[80px] h-[80px] shrink-0 overflow-hidden flex items-center justify-center rounded-xl bg-neutral-900">
            <img
              src={step.ninja.img}
              alt={step.ninja.name}
              width={160}
              height={160}
              className="w-full h-full object-contain p-1"
              title={step.ninja.name}
            />
          </div>
          <div className="flex items-center justify-center">
            {step.skillId && (
              <SkillPopover
                ninja={step.ninja}
                skillId={step.skillId}
                skillType={step.action === "Esoterica" ? "mystery" : "chase"}
              >
                <div className="cursor-help">
                  <div className="w-[50px] h-[50px] p-[1px] bg-slate-400/90 rounded">
                    <img
                      src={getSkillImageUrl(step.iconId)}
                      alt="Skill"
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </SkillPopover>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <div className="relative bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700/50 h-[100px] sm:h-[120px] md:h-[140px] w-[150px] sm:w-[180px] md:w-[200px] flex items-center justify-center gap-2 px-2">
        {stepNumber && totalSteps && (
          <div className="absolute top-1.5 left-1.5 z-30 px-1.5 py-0.5 bg-neutral-800 rounded text-[8px] sm:text-[9px] font-medium text-slate-300 border border-neutral-600">
            {stepNumber}/{totalSteps}
          </div>
        )}

        <div className="relative w-[80px] h-[80px] shrink-0 overflow-hidden flex items-center justify-center rounded-xl bg-neutral-900">
          <img
            src={step.ninja.img}
            alt={step.ninja.name}
            width={160}
            height={160}
            className="w-full h-full object-contain p-1"
          />
        </div>

        <div className="relative z-20 flex items-center justify-center">
          {step.skillId && (
            <SkillPopover
              ninja={step.ninja}
              skillId={step.skillId}
              skillType={step.action === "Esoterica" ? "mystery" : "chase"}
            >
              <div className="cursor-help">
                <div className="w-[50px] h-[50px] p-[1px] bg-slate-500 rounded shadow-lg">
                  <img
                    src={getSkillImageUrl(step.iconId)}
                    alt="Skill"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </SkillPopover>
          )}
        </div>
      </div>

      {stepNumber && (
        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 z-40">
          <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-slate-500 rounded-full border-2 border-neutral-900 shadow-lg">
            <span className="text-[7px] sm:text-[8px] font-bold text-white">
              {stepNumber}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const ComboHeader = memo(({ chain, showActions = true }: { chain: ComboChainType; showActions?: boolean }) => {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-slate-500 rounded-lg shadow-lg shrink-0">
          <Icon icon="mdi:shuriken" className="text-white text-sm sm:text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
            <span className="truncate">{chain.starter.name}</span>
            {showActions && (
              <span className="text-[10px] sm:text-sm font-medium text-slate-400 shrink-0">
                {chain.steps[0]?.action === "Esoterica" ? "Mystery" : "Chase"}
              </span>
            )}
          </h3>
          <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5">
            {chain.steps.length} hits · {chain.totalHits} total
          </p>
        </div>
      </div>
    </div>
  );
});

ComboHeader.displayName = 'ComboHeader';

export const ComboChainComponent = memo(({ chain, layout = "horizontal", showHeader = true }: ComboChainProps) => {
  if (layout === "vertical") {
    return (
      <div className="relative w-full">
        {showHeader && <ComboHeader chain={chain} showActions={false} />}

        <div>
          <div className="flex flex-col items-center gap-0">
            {chain.steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="relative w-[120px] sm:w-[140px] md:w-[160px] h-[56px] sm:h-[60px] pr-[10px] sm:pr-[14px]">
                  <div className="absolute inset-0 -z-10 rounded bg-neutral-800 border border-neutral-600/50" />

                  <div className="absolute top-1 right-1 z-20 px-1 sm:px-1.5 py-0.5 bg-slate-500/80 rounded text-[6px] sm:text-[7px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                    {step.action === "Esoterica" ? "MIST" : "PERS"}
                  </div>

                  <div className="absolute top-1 left-1 z-20 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 bg-slate-500 rounded-full border border-neutral-900 shadow">
                    <span className="text-[7px] sm:text-[8px] font-bold text-white">{idx + 1}</span>
                  </div>

                  <div className="flex items-center justify-between h-full">
                    <div className="w-14 h-14 sm:w-12 sm:h-12 md:w-12 md:h-12 shrink-0 overflow-hidden rounded-l flex items-end">
                      <img
                        src={step.ninja.img}
                        alt={step.ninja.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-contain"
                        title={step.ninja.name}
                      />
                    </div>

                    <div className="flex items-center justify-center flex-1">
                      {step.skillId && (
                        <SkillPopover
                          ninja={step.ninja}
                          skillId={step.skillId}
                          skillType={step.action === "Esoterica" ? "mystery" : "chase"}
                        >
                          <div className="cursor-help">
                            <div className="w-[36px] sm:w-[42px] h-[36px] sm:h-[42px] p-[1px] bg-slate-500 rounded shadow-lg">
                              <img
                                src={getSkillImageUrl(step.iconId)}
                                alt="Skill"
                                width={84}
                                height={84}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          </div>
                        </SkillPopover>
                      )}
                    </div>
                  </div>
                </div>

                {idx < chain.steps.length - 1 && (
                  <div className="flex items-center justify-center py-1">
                    <Icon icon="solar:alt-arrow-down-linear" className="text-slate-400 text-xl" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="h-0.5 bg-slate-500/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {showHeader && <ComboHeader chain={chain} />}

      <div>
        <div className="flex items-center gap-0 overflow-x-auto overflow-y-visible pb-4 pt-2 px-2 scroll-smooth custom-scrollbar">
          {chain.steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <ComboStepCard
                step={step}
                stepNumber={idx + 1}
                totalSteps={chain.steps.length}
                layout="card"
              />

              {idx < chain.steps.length - 1 && (
                <div className="relative flex items-center justify-center px-2 sm:px-3 shrink-0">
                  <div className="relative flex items-center gap-0.5">
                    <div className="w-3 sm:w-8 h-0.5 bg-slate-500/50" />
                    <Icon icon="solar:alt-arrow-right-linear" className="text-slate-400 text-sm sm:text-xl" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="absolute bottom-2 right-2 text-slate-600 text-xs flex items-center gap-1 pointer-events-none">
          <Icon icon="solar:swipe-horizontal-linear" className="text-sm" />
          <span className="hidden sm:inline text-[10px]">Scroll to see all</span>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <div className="h-0.5 bg-slate-500/20 rounded" />
      </div>
    </div>
  );
});

ComboChainComponent.displayName = 'ComboChainComponent';

export type { ComboChainType };
export { ComboChainComponent as ComboChain };

export const ComboChainStep = memo(({ step }: { step: ComboStep }) => {
  return <ComboStepCard step={step} layout="compact" />;
});

ComboChainStep.displayName = 'ComboChainStep';
