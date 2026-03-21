"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { useDragState } from "@/components/providers/formation-provider";
import { useMediaQuery } from "@/hooks/use-media-query";

interface StatsHeaderProps {
  totalPower?: number;
  selectedCount?: number;
  onClear?: () => void;
  onResetImages?: () => void;
}

interface Item {
  id: number;
  name: string;
  imageUrl: string;
}

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: Item[];
  onSelectItem: (item: Item) => void;
  isSkinModal?: boolean;
}

const DEFAULT_IMAGE_1 = "/skins/main-10000101.jpg";

const SUMMON_ITEMS: Item[] = [
  { id: 20000040, name: "Summon 20000040", imageUrl: "/summons/20000040.png" },
  { id: 20000041, name: "Summon 20000041", imageUrl: "/summons/20000041.png" },
  { id: 20000042, name: "Summon 20000042", imageUrl: "/summons/20000042.png" },
  { id: 20000043, name: "Summon 20000043", imageUrl: "/summons/20000043.png" },
  { id: 20000044, name: "Summon 20000044", imageUrl: "/summons/20000044.png" },
  { id: 20000045, name: "Summon 20000045", imageUrl: "/summons/20000045.png" },
  { id: 20000046, name: "Summon 20000046", imageUrl: "/summons/20000046.png" },
  { id: 20000047, name: "Summon 20000047", imageUrl: "/summons/20000047.png" },
  { id: 20000054, name: "Summon 20000054", imageUrl: "/summons/20000054.png" },
  { id: 20000019, name: "Summon 20000019", imageUrl: "/summons/20000019.png" },
  { id: 20000020, name: "Summon 20000020", imageUrl: "/summons/20000020.png" },
  { id: 20000021, name: "Summon 20000021", imageUrl: "/summons/20000021.png" },
  { id: 20000022, name: "Summon 20000022", imageUrl: "/summons/20000022.png" },
  { id: 20000023, name: "Summon 20000023", imageUrl: "/summons/20000023.png" },
  { id: 20000024, name: "Summon 20000024", imageUrl: "/summons/20000024.png" },
  { id: 20000025, name: "Summon 20000025", imageUrl: "/summons/20000025.png" },
  { id: 20000026, name: "Summon 20000026", imageUrl: "/summons/20000026.png" },
  { id: 20000027, name: "Summon 20000027", imageUrl: "/summons/20000027.png" },
  { id: 20000028, name: "Summon 20000028", imageUrl: "/summons/20000028.png" },
  { id: 20000029, name: "Summon 20000029", imageUrl: "/summons/20000029.png" },
  { id: 20000030, name: "Summon 20000030", imageUrl: "/summons/20000030.png" },
  { id: 20000031, name: "Summon 20000031", imageUrl: "/summons/20000031.png" },
  { id: 20000033, name: "Summon 20000033", imageUrl: "/summons/20000033.png" },
  { id: 20000034, name: "Summon 20000034", imageUrl: "/summons/20000034.png" },
  { id: 20000035, name: "Summon 20000035", imageUrl: "/summons/20000035.png" },
  { id: 20000036, name: "Summon 20000036", imageUrl: "/summons/20000036.png" },
  { id: 20000037, name: "Summon 20000037", imageUrl: "/summons/20000037.png" },
  { id: 20000038, name: "Summon 20000038", imageUrl: "/summons/20000038.png" },
  { id: 20000039, name: "Summon 20000039", imageUrl: "/summons/20000039.png" },
  { id: 20000006, name: "Summon 20000006", imageUrl: "/summons/20000006.png" },
  { id: 20000007, name: "Summon 20000007", imageUrl: "/summons/20000007.png" },
  { id: 20000008, name: "Summon 20000008", imageUrl: "/summons/20000008.png" },
  { id: 20000009, name: "Summon 20000009", imageUrl: "/summons/20000009.png" },
  { id: 20000010, name: "Summon 20000010", imageUrl: "/summons/20000010.png" },
  { id: 20000011, name: "Summon 20000011", imageUrl: "/summons/20000011.png" },
  { id: 20000012, name: "Summon 20000012", imageUrl: "/summons/20000012.png" },
  { id: 20000013, name: "Summon 20000013", imageUrl: "/summons/20000013.png" },
  { id: 20000014, name: "Summon 20000014", imageUrl: "/summons/20000014.png" },
  { id: 20000015, name: "Summon 20000015", imageUrl: "/summons/20000015.png" },
  { id: 20000016, name: "Summon 20000016", imageUrl: "/summons/20000016.png" },
  { id: 20000017, name: "Summon 20000017", imageUrl: "/summons/20000017.png" },
  { id: 20000018, name: "Summon 20000018", imageUrl: "/summons/20000018.png" },
  { id: 20000051, name: "Summon 20000051", imageUrl: "/summons/20000051.png" },
  { id: 20000001, name: "Summon 20000001", imageUrl: "/summons/20000001.png" },
  { id: 20000002, name: "Summon 20000002", imageUrl: "/summons/20000002.png" },
  { id: 20000003, name: "Summon 20000003", imageUrl: "/summons/20000003.png" },
  { id: 20000004, name: "Summon 20000004", imageUrl: "/summons/20000004.png" },
  { id: 20000005, name: "Summon 20000005", imageUrl: "/summons/20000005.png" },
];

const SKIN_ITEMS: Item[] = [
  { id: 1, name: "Skin 100001", imageUrl: "/skins/main-10000101.jpg" },
  { id: 2, name: "Skin 100002", imageUrl: "/skins/main-10000201.jpg" },
  { id: 3, name: "Skin 100003", imageUrl: "/skins/main-10000301.jpg" },
  { id: 4, name: "Skin 100004", imageUrl: "/skins/main-10000401.jpg" },
  { id: 5, name: "Skin 100005", imageUrl: "/skins/main-10000501(1).jpg" },
];

const ItemModal = React.memo(function ItemModal({
  isOpen,
  onClose,
  title,
  items,
  onSelectItem,
  isSkinModal = false,
}: ItemModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-black rounded-lg w-full ${isSkinModal ? "max-w-[495px]" : "max-w-[450px]"} max-h-[480px] overflow-hidden shadow-2xl border border-neutral-800`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800">
          <h3 className="text-white text-lg font-medium">{title}</h3>
        </div>

        {/* Content - Grid estilo Radix RadioCards */}
        <div
          className={`p-4 ${isSkinModal ? "" : "overflow-y-auto max-h-[420px]"}`}
        >
          <div
            className={
              isSkinModal
                ? "flex gap-3 overflow-x-auto justify-center"
                : "grid grid-cols-4 gap-3"
            }
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`aspect-square ${isSkinModal ? "w-[72px]" : "w-[80px]"} rounded-lg bg-neutral-900/50 hover:bg-neutral-800/50 transition-all flex items-center justify-center overflow-hidden group ${isSkinModal ? "shrink-0" : ""}`}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={isSkinModal ? 72 : 80}
                  height={isSkinModal ? 72 : 80}
                  className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if open state or content-relevant props change
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.title === nextProps.title &&
    prevProps.isSkinModal === nextProps.isSkinModal &&
    prevProps.items === nextProps.items &&
    prevProps.onSelectItem === nextProps.onSelectItem &&
    prevProps.onClose === nextProps.onClose
  );
});

export const StatsHeader = React.memo(function StatsHeader({
  totalPower,
  selectedCount,
  onClear,
}: StatsHeaderProps) {
  const t = useTranslations("formation");
  const { isDragEnabled, toggleDragEnabled } = useDragState();
  // Detect desktop by screen width instead of hover capability
  // This allows the lock button to appear when resizing to mobile size
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Modal state: [summon, skin]
  const [modal1Open, setModal1Open] = useState(false);
  const [modal2Open, setModal2Open] = useState(false);
  const [selectedImage1, setSelectedImage1] = useState("/summons/base.png");
  const [selectedImage2, setSelectedImage2] = useState(
    "/skins/main-10000101.jpg",
  );

  const handleSelectItem1 = useCallback((item: Item) => {
    setSelectedImage1(item.imageUrl);
    setModal1Open(false);
  }, []);

  const handleSelectItem2 = useCallback((item: Item) => {
    setSelectedImage2(item.imageUrl);
    setModal2Open(false);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedImage1("/summons/base.png");
    setSelectedImage2("/skins/main-10000101.jpg");
    onClear?.();
  }, [onClear]);

  return (
    <>
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 h-14 shrink-0">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-neutral-400" suppressHydrationWarning>
            {t("stats", { count: selectedCount || 0 })}
          </span>
          <span
            className="text-amber-500 font-semibold"
            suppressHydrationWarning
          >
            ⚔️ {totalPower?.toLocaleString() || 0} BP
          </span>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center">
          {!isDesktop && (
            <button
              onClick={toggleDragEnabled}
              className={`w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] flex items-center justify-center rounded-lg border transition-all group ${
                isDragEnabled
                  ? "border-neutral-700 hover:bg-neutral-800/50 text-neutral-400 hover:text-white"
                  : "border-amber-700 bg-amber-950/30 text-amber-400"
              }`}
              title={isDragEnabled ? t("dragEnabled") : t("dragDisabled")}
            >
              <Icon
                icon={
                  isDragEnabled
                    ? "solar:lock-unlocked-outline"
                    : "solar:lock-linear"
                }
                className="w-6 h-6 sm:w-7 sm:h-7"
              />
            </button>
          )}
          {onClear && (
            <button
              onClick={handleClear}
              className="w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] flex items-center justify-center rounded-lg border border-neutral-700 hover:bg-red-950/30 hover:border-red-800 text-neutral-400 hover:text-red-400 transition-all group"
              title={t("clearFormation")}
            >
              <Icon
                icon="solar:trash-bin-minimalistic-linear"
                className="w-6 h-6 sm:w-7 sm:h-7"
              />
            </button>
          )}
          <button
            onClick={() => setModal2Open(true)}
            className="w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] rounded-lg border border-neutral-700 hover:bg-neutral-800/50 transition-all group p-[3px]"
            title={t("openItems2")}
          >
            <Image
              src={selectedImage2}
              alt={t("itemsSet2")}
              width={62}
              height={62}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform"
              suppressHydrationWarning
            />
          </button>
          <button
            onClick={() => setModal1Open(true)}
            className="w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] rounded-lg border border-neutral-700 hover:bg-neutral-800/50 transition-all group p-[3px]"
            title={t("openItems1")}
          >
            <Image
              src={selectedImage1}
              alt={t("itemsSet1")}
              width={62}
              height={62}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform"
              suppressHydrationWarning
            />
          </button>
        </div>
      </div>

      <ItemModal
        isOpen={modal1Open}
        onClose={() => setModal1Open(false)}
        title={t("itemsSet1")}
        items={SUMMON_ITEMS}
        onSelectItem={handleSelectItem1}
      />
      <ItemModal
        isOpen={modal2Open}
        onClose={() => setModal2Open(false)}
        title={t("itemsSet2")}
        items={SKIN_ITEMS}
        onSelectItem={handleSelectItem2}
        isSkinModal={true}
      />
    </>
  );
});
