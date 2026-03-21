export interface FormationSlotConfig {
  x: string;
  y: string;
  width: string;
  height: string;
  zIndex?: number;
}

export interface FormationLayoutConfig {
  containerWidth: string;
  containerHeight: string;
  slots: {
    slot1: FormationSlotConfig;
    slot2: FormationSlotConfig;
    slot3: FormationSlotConfig;
    slot4: FormationSlotConfig;
    slot5: FormationSlotConfig;
    slot6: FormationSlotConfig;
    slot7: FormationSlotConfig;
    slot8: FormationSlotConfig;
    slot9: FormationSlotConfig;
  };
}

/**
 * Default layout configuration with fixed 400x200 container
 * Each slot is positioned independently using absolute positioning
 */
export const defaultLayoutConfig: FormationLayoutConfig = {
  containerWidth: "400px",
  containerHeight: "200px",
  slots: {
    slot7: { x: "65px", y: "35px", width: "70px", height: "50px", zIndex: 6 },
    slot4: { x: "150px", y: "35px", width: "80px", height: "50px", zIndex: 6 },
    slot1: { x: "240px", y: "35px", width: "80px", height: "50px", zIndex: 6 },
    slot8: { x: "50px", y: "90px", width: "80px", height: "45px", zIndex: 7 },
    slot5: { x: "150px", y: "90px", width: "85px", height: "45px", zIndex: 7 },
    slot2: { x: "245px", y: "90px", width: "85px", height: "45px", zIndex: 7 },
    slot9: { x: "35px", y: "145px", width: "95px", height: "53px", zIndex: 8 },
    slot6: { x: "150px", y: "145px", width: "95px", height: "53px", zIndex: 8 },
    slot3: { x: "250px", y: "145px", width: "95px", height: "53px", zIndex: 8 },
  },
};

/**
 * Desktop layout configuration - 30% larger than default
 * For screens 1024px and above (PC/desktop)
 */
export const desktopLayoutConfig: FormationLayoutConfig = {
  containerWidth: "520px",
  containerHeight: "260px",
  slots: {
    slot7: { x: "84.5px", y: "45.5px", width: "91px", height: "65px", zIndex: 6 },
    slot4: { x: "195px", y: "45.5px", width: "104px", height: "65px", zIndex: 6 },
    slot1: { x: "312px", y: "45.5px", width: "104px", height: "65px", zIndex: 6 },
    slot8: { x: "65px", y: "117px", width: "104px", height: "58.5px", zIndex: 7 },
    slot5: { x: "195px", y: "117px", width: "110.5px", height: "58.5px", zIndex: 7 },
    slot2: { x: "318.5px", y: "117px", width: "110.5px", height: "58.5px", zIndex: 7 },
    slot9: { x: "45.5px", y: "188.5px", width: "123.5px", height: "68.9px", zIndex: 8 },
    slot6: { x: "195px", y: "188.5px", width: "123.5px", height: "68.9px", zIndex: 8 },
    slot3: { x: "325px", y: "188.5px", width: "123.5px", height: "68.9px", zIndex: 8 },
  },
};

/**
 * Merges custom configuration with defaults
 * @param customConfig - Partial configuration to override defaults
 * @param isDesktop - Whether to use desktop layout (30% larger)
 * @returns Complete layout configuration
 */
export function getLayoutConfig(
  customConfig?: Partial<FormationLayoutConfig>,
  isDesktop?: boolean,
): FormationLayoutConfig {
  const baseConfig = isDesktop ? desktopLayoutConfig : defaultLayoutConfig;

  if (!customConfig) return baseConfig;

  return {
    containerWidth: customConfig.containerWidth ?? baseConfig.containerWidth,
    containerHeight: customConfig.containerHeight ?? baseConfig.containerHeight,
    slots: {
      slot1: { ...baseConfig.slots.slot1, ...customConfig.slots?.slot1 },
      slot2: { ...baseConfig.slots.slot2, ...customConfig.slots?.slot2 },
      slot3: { ...baseConfig.slots.slot3, ...customConfig.slots?.slot3 },
      slot4: { ...baseConfig.slots.slot4, ...customConfig.slots?.slot4 },
      slot5: { ...baseConfig.slots.slot5, ...customConfig.slots?.slot5 },
      slot6: { ...baseConfig.slots.slot6, ...customConfig.slots?.slot6 },
      slot7: { ...baseConfig.slots.slot7, ...customConfig.slots?.slot7 },
      slot8: { ...baseConfig.slots.slot8, ...customConfig.slots?.slot8 },
      slot9: { ...baseConfig.slots.slot9, ...customConfig.slots?.slot9 },
    },
  };
}
