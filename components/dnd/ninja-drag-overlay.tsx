"use client";

import Image from "next/image";
import { Ninja } from "@/lib/types";

interface NinjaDragOverlayProps {
  ninja: Ninja;
}

export function NinjaDragOverlay({ ninja }: NinjaDragOverlayProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "90px",
        height: "110px",
        cursor: "grabbing",
        pointerEvents: "none",
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <img
        src="/slot-base.png"
        width={300}
        height={300}
        alt="slot base"
        style={{
          position: "absolute",
          opacity: 0.85,
          width: "80px",
          height: "80px",
          objectFit: "contain",
          zIndex: 0,
          top: "10px",
          left: 0,
          pointerEvents: "none",
        }}
      />

      <Image
        src={ninja.display}
        alt={ninja.name}
        width={200}
        height={200}
        quality={85}
        style={{
          height: "60px",
          width: "auto",
          objectFit: "contain",
          position: "absolute",
          zIndex: 10,
          top: "-2px",
          bottom: "5px",
          left: "50%",
          transform: "translateX(-50%) scale(4.25)",
          transformOrigin: "bottom center",
          filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.5))",
          pointerEvents: "none",
        }}
        loading="eager"
        priority
      />
    </div>
  );
}
