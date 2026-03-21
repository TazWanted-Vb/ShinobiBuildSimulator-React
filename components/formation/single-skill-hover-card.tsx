"use client";

import { memo, useState } from "react";
import { HoverCard, HoverCardTrigger, HoverCardPortal, HoverCardContent } from "@radix-ui/react-hover-card";
import type { Skill, Ninja, SkillCategory } from "@/lib/types";
import { getSkillDisplayData } from "@/lib/skill-utils";
import { CompactSkillItem } from "./compact-skill-item";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SingleSkillHoverCardProps {
  skill: Skill;
  ninja: Ninja;
  skillCategory: SkillCategory;
  children: React.ReactNode;
}

/**
 * SingleSkillHoverCard - Hover card for showing individual skill details
 *
 * This component wraps a skill element (icon, button, etc.) and shows detailed
 * skill information on hover, similar to the combo page skill hover.
 *
 * Features:
 * - Uses Radix UI HoverCard for reliable positioning
 * - Shows skill icon, name, description, cooldown, chakra
 * - Disabled on mobile (touch devices)
 * - 100ms open delay for responsive feel
 */
export const SingleSkillHoverCard = memo(function SingleSkillHoverCard({
  skill,
  ninja,
  skillCategory,
  children,
}: SingleSkillHoverCardProps) {
  const isDesktop = useMediaQuery("(hover: hover)");
  const [open, setOpen] = useState(false);

  // Map skill category to display type
  const getSkillType = (category: SkillCategory): "mystery" | "attack" | "chase" => {
    switch (category) {
      case "esoterico":
        return "mystery";
      case "combate":
        return "attack";
      case "perseguição":
      case "passivo1":
      case "passivo2":
      case "passivo3":
        return "chase";
      default:
        return "chase";
    }
  };

  // Convert skill to display data
  const skillDisplayData = getSkillDisplayData(
    skill,
    getSkillType(skillCategory),
    ninja,
    undefined, // chaseIndex - not applicable for evolution skills
    "pt", // locale - could be passed as prop if needed
  );

  // Don't render hover card on mobile
  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <HoverCard
      open={open}
      onOpenChange={setOpen}
      openDelay={100}
      closeDelay={0}
    >
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent
          side="right"
          align="center"
          alignOffset={0}
          sideOffset={16}
          avoidCollisions
          collisionPadding={16}
          sticky="always"
          hideWhenDetached
          className="bg-neutral-950 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-w-[440px] z-[9999] transition-all duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <div className="p-3">
            <CompactSkillItem skill={skillDisplayData} />
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
});
