"use client";

import { memo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ComboStep } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isImageLoaded as checkImageLoaded, markImageAsLoaded } from "@/lib/image-cache";
import { getSkillImageUrl } from "@/lib/image-urls";
import { SkillPopover } from "./skill-popover";

interface ComboStepCardProps {
  step: ComboStep;
  stepNumber: number;
}

function ComboStepCardComponent({ step, stepNumber }: ComboStepCardProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(checkImageLoaded(step.ninja.img));

  useEffect(() => {
    setIsImageLoaded(checkImageLoaded(step.ninja.img));
  }, [step.ninja.img]);

  // Determinar o tipo de skill baseado na ação
  const skillType = step.action === "Esoterica" ? "mystery" : "chase";

  // Para chase skills, calcular o índice correto no array chaseSkillIds
  let chaseIndex: number | undefined;
  if (step.action !== "Esoterica" && step.skillId) {
    chaseIndex = step.ninja.chaseSkillIds.findIndex(id => id === step.skillId) + 1;
    // Se não encontrar no chaseSkillIds, tentar encontrar no chaseSkills pelo ID
    if (chaseIndex === 0) {
      chaseIndex = step.ninja.chaseSkills.findIndex(s => s.id === step.skillId) + 1;
    }
    // Se ainda não encontrar (index 0), definir como undefined
    if (chaseIndex === 0) {
      chaseIndex = undefined;
    }
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-lg border-2 transition-all duration-200 overflow-hidden select-none shrink-0",
        "border-neutral-800",
        "h-[95px] w-[180px]",
        "sm:h-[90px] sm:w-[200px]",
        "md:h-[90px] md:w-[220px]"
      )}
    >
      {/* Step Number Badge */}
      <div className="absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 bg-slate-500/80 rounded text-[8px] font-bold text-white backdrop-blur-sm">
        {stepNumber}
      </div>

      {/* Ninja Image Container - same positioning as ninja-card */}
      <div className="absolute inset-y-0 left-0 w-[180px] sm:w-[200px] md:w-[220px] h-full">
        <Image
          ref={imgRef as React.RefObject<HTMLImageElement>}
          src={step.ninja.img}
          alt={step.ninja.name}
          draggable={false}
          fill
          sizes="(max-width: 640px) 180px, (max-width: 768px) 200px, 220px"
          quality={85}
          className={cn(
            "object-cover transition-opacity duration-300",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => {
            markImageAsLoaded(step.ninja.img);
            setIsImageLoaded(true);
          }}
        />
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/50 to-neutral-950" />
      </div>

      {/* Skill Image Container - Right side, aligned with ninja-card */}
      <div className="relative z-10 flex-1 ml-[90px] sm:ml-[100px] md:ml-[110px] pr-2 flex items-center justify-center">
        {step.skillId && (
          <SkillPopover
            ninja={step.ninja}
            skillId={step.skillId}
            skillType={skillType}
            chaseIndex={chaseIndex}
          >
            <div className="relative w-[50px] h-[50px] sm:w-[55px] sm:h-[55px] cursor-help">
              <div className="absolute inset-0 p-[1px] bg-slate-400/90 rounded-lg">
                <img
                  src={getSkillImageUrl(step.iconId)}
                  alt="Skill"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </SkillPopover>
        )}
      </div>
    </div>
  );
}

export const ComboStepCard = memo(ComboStepCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.step.ninja.id === nextProps.step.ninja.id &&
    prevProps.step.skillId === nextProps.step.skillId &&
    prevProps.stepNumber === nextProps.stepNumber
  );
});

ComboStepCard.displayName = 'ComboStepCard';
