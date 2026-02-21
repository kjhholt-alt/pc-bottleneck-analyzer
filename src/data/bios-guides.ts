// ─── Per-Motherboard BIOS Optimization Guides ──────────────────────────────
//
// Maps motherboard manufacturers to their specific BIOS menu navigation paths.
// Used to give users exact step-by-step instructions instead of generic
// "enable XMP in BIOS" advice.

export type BIOSBrand = "ASUS" | "MSI" | "Gigabyte" | "ASRock" | "EVGA" | "NZXT" | "Biostar";

export interface BIOSGuide {
  brand: BIOSBrand;
  biosName: string; // e.g., "ASUS UEFI BIOS", "MSI Click BIOS 5"
  enterKey: string; // Key to press at boot
  xmp: BIOSSteps;
  resizableBar: BIOSSteps;
  powerLimits: BIOSSteps;
  virtualization: BIOSSteps;
  secureBoot: BIOSSteps;
  fanCurve: BIOSSteps;
  fastBoot: BIOSSteps;
  biosUpdate: BIOSUpdateInfo;
}

export interface BIOSSteps {
  menuPath: string; // e.g., "AI Tweaker → AI Overclock Tuner → XMP I"
  steps: string[];  // Step-by-step instructions
  notes?: string;   // Brand-specific quirks
}

export interface BIOSUpdateInfo {
  method: string;
  utilityName: string; // e.g., "EZ Flash 3", "M-FLASH"
  menuPath: string;
  steps: string[];
  warning: string;
}

// ─── Brand Detection ────────────────────────────────────────────────────────

const BRAND_PATTERNS: [RegExp, BIOSBrand][] = [
  [/\b(asus|rog|tuf|prime|proart|strix)\b/i, "ASUS"],
  [/\b(msi|mag|mpg|meg|pro series)\b/i, "MSI"],
  [/\b(gigabyte|aorus|eagle|gaming x|windforce)\b/i, "Gigabyte"],
  [/\b(asrock|phantom|taichi|steel legend)\b/i, "ASRock"],
  [/\b(evga)\b/i, "EVGA"],
  [/\b(nzxt)\b/i, "NZXT"],
  [/\b(biostar)\b/i, "Biostar"],
];

/**
 * Detect motherboard brand from model string.
 * Returns null if brand is unrecognized.
 */
export function detectBrand(motherboardModel: string): BIOSBrand | null {
  for (const [pattern, brand] of BRAND_PATTERNS) {
    if (pattern.test(motherboardModel)) return brand;
  }
  return null;
}

/**
 * Get the BIOS guide for a motherboard model.
 * Falls back to a generic guide if brand is unrecognized.
 */
export function getBIOSGuide(motherboardModel: string): BIOSGuide {
  const brand = detectBrand(motherboardModel);
  if (brand && BIOS_GUIDES[brand]) return BIOS_GUIDES[brand];
  return GENERIC_GUIDE;
}

/**
 * Get a quick one-liner for a specific BIOS setting path.
 */
export function getQuickPath(
  motherboardModel: string,
  setting: "xmp" | "resizableBar" | "powerLimits" | "virtualization" | "secureBoot" | "fanCurve",
): string {
  const guide = getBIOSGuide(motherboardModel);
  return guide[setting].menuPath;
}

// ─── BIOS Guide Database ────────────────────────────────────────────────────

const BIOS_GUIDES: Record<BIOSBrand, BIOSGuide> = {
  // ── ASUS ────────────────────────────────────────────────────────────────
  ASUS: {
    brand: "ASUS",
    biosName: "ASUS UEFI BIOS (EZ Mode / Advanced Mode)",
    enterKey: "Del or F2",
    xmp: {
      menuPath: "AI Tweaker → AI Overclock Tuner → XMP I / XMP II",
      steps: [
        "Press Del or F2 at boot to enter BIOS.",
        "Press F7 to switch to Advanced Mode if in EZ Mode.",
        "Go to the 'AI Tweaker' tab (or 'Extreme Tweaker' on ROG boards).",
        "Find 'AI Overclock Tuner' — set it to 'XMP I' or 'XMP II'.",
        "XMP I = standard rated speed. XMP II = slightly higher (if your kit supports it).",
        "Press F10 to save and exit.",
      ],
      notes:
        "On newer ASUS boards (Z790+), this may appear as 'ASUS Enhanced Memory Profile (AEMP)' alongside XMP. For AMD boards, look for 'D.O.C.P.' or 'EXPO' instead of XMP.",
    },
    resizableBar: {
      menuPath: "Advanced → PCI Subsystem Settings → Re-Size BAR Support → Enabled",
      steps: [
        "Enter BIOS (Del/F2) → switch to Advanced Mode (F7).",
        "Go to 'Advanced' tab → 'PCI Subsystem Settings'.",
        "Set 'Re-Size BAR Support' to Enabled.",
        "Also enable 'Above 4G Decoding' if it's not already on.",
        "Save and exit (F10).",
        "After rebooting, enable ReBAR in your GPU driver (NVIDIA Control Panel or AMD Adrenalin).",
      ],
    },
    powerLimits: {
      menuPath: "AI Tweaker → Internal CPU Power Management",
      steps: [
        "Go to 'AI Tweaker' → 'Internal CPU Power Management'.",
        "For Intel: Set 'Long Duration Package Power Limit' and 'Short Duration Package Power Limit' to the max your cooler supports.",
        "For AMD (PBO): Go to 'AI Tweaker' → 'Precision Boost Overdrive' → set to 'Enabled' or 'Advanced'.",
        "Advanced PBO lets you set custom power limits, scalar, and curve optimizer values.",
      ],
      notes:
        "ASUS boards often have 'Multi-Core Enhancement' that removes Intel power limits automatically. Enable it for maximum performance if cooling allows.",
    },
    virtualization: {
      menuPath: "Advanced → CPU Configuration → Intel (VMX) or SVM Mode → Enabled",
      steps: [
        "Go to 'Advanced' tab → 'CPU Configuration'.",
        "For Intel: Find 'Intel Virtualization Technology' (VT-x) → Enabled.",
        "For AMD: Find 'SVM Mode' → Enabled.",
        "Save and exit.",
      ],
    },
    secureBoot: {
      menuPath: "Boot → Secure Boot → OS Type → Windows UEFI",
      steps: [
        "Go to 'Boot' tab → 'Secure Boot'.",
        "Set 'OS Type' to 'Windows UEFI mode'.",
        "Ensure 'Secure Boot State' shows 'Enabled'.",
        "If it won't enable, you may need to install Secure Boot keys first: 'Key Management' → 'Install Default Secure Boot keys'.",
      ],
    },
    fanCurve: {
      menuPath: "Monitor → Q-Fan Configuration",
      steps: [
        "Go to 'Monitor' tab → 'Q-Fan Configuration'.",
        "Select the fan header you want to adjust (CPU Fan, Chassis Fan, etc.).",
        "Set to 'Manual' for custom curve or 'Performance' for aggressive cooling.",
        "Adjust temperature thresholds and fan speeds to your preference.",
      ],
      notes:
        "ASUS Fan Xpert 4 (in Armoury Crate software) gives a more visual fan curve editor if you prefer doing it from Windows.",
    },
    fastBoot: {
      menuPath: "Boot → Fast Boot → Disabled",
      steps: [
        "Go to 'Boot' tab.",
        "Set 'Fast Boot' to 'Disabled' if you have trouble entering BIOS.",
        "This adds ~2-3 seconds to boot but ensures Del/F2 always works.",
      ],
    },
    biosUpdate: {
      method: "USB flash",
      utilityName: "ASUS EZ Flash 3",
      menuPath: "Tool → ASUS EZ Flash 3 Utility",
      steps: [
        "Download the latest BIOS from the ASUS support page for your exact motherboard model.",
        "Extract the .CAP file to a FAT32-formatted USB drive.",
        "Enter BIOS → go to 'Tool' tab → 'ASUS EZ Flash 3 Utility'.",
        "Select the USB drive and the BIOS file.",
        "Confirm and wait — do NOT turn off the PC during the update.",
        "The system will reboot automatically when done.",
      ],
      warning:
        "Some ASUS ROG boards support BIOS Flashback — a button on the rear I/O that flashes BIOS without even powering on the CPU. Check your manual.",
    },
  },

  // ── MSI ─────────────────────────────────────────────────────────────────
  MSI: {
    brand: "MSI",
    biosName: "MSI Click BIOS 5 / Click BIOS X",
    enterKey: "Del",
    xmp: {
      menuPath: "OC → DRAM Configuration → A-XMP / XMP → Profile 1",
      steps: [
        "Press Del at boot to enter BIOS.",
        "Press F7 to switch to Advanced Mode if in EZ Mode.",
        "Go to 'OC' section (Overclocking).",
        "Find 'A-XMP' (AMD) or 'XMP' (Intel) dropdown.",
        "Select 'Profile 1' (or 'Profile 2' if available and higher speed).",
        "Press F10 to save and exit.",
      ],
      notes:
        "MSI's EZ Mode main screen often has an XMP toggle right on the dashboard — look for 'A-XMP' in the top-left corner. One click enables it without entering Advanced Mode.",
    },
    resizableBar: {
      menuPath: "Settings → Advanced → PCI Subsystem Settings → Re-Size BAR Support → Enabled",
      steps: [
        "Enter BIOS (Del) → Advanced Mode (F7).",
        "Go to 'Settings' → 'Advanced' → 'PCI Subsystem Settings'.",
        "Enable 'Above 4G memory / Crypto Currency mining' (yes, confusing name).",
        "Enable 'Re-Size BAR Support'.",
        "Save and exit.",
      ],
      notes:
        "MSI labels the Above 4G Decoding setting with a crypto mining reference — this is just a naming quirk, it's the same setting.",
    },
    powerLimits: {
      menuPath: "OC → Advanced CPU Configuration",
      steps: [
        "Go to 'OC' → 'Advanced CPU Configuration'.",
        "For Intel: Adjust 'Long Duration Power Limit (PL1)' and 'Short Duration Power Limit (PL2)'.",
        "For AMD: Find 'PBO' (Precision Boost Overdrive) → set to 'Advanced'.",
        "Adjust PPT, TDC, and EDC limits for AMD.",
      ],
    },
    virtualization: {
      menuPath: "OC → CPU Features → Intel VT / SVM Mode → Enabled",
      steps: [
        "Go to 'OC' → 'CPU Features'.",
        "Find 'Intel Virtualization Technology' or 'SVM Mode'.",
        "Set to 'Enabled'. Save and exit.",
      ],
    },
    secureBoot: {
      menuPath: "Settings → Security → Secure Boot → Secure Boot → Enabled",
      steps: [
        "Go to 'Settings' → 'Security' → 'Secure Boot'.",
        "Set 'Secure Boot Mode' to 'Standard'.",
        "Set 'Secure Boot' to 'Enabled'.",
      ],
    },
    fanCurve: {
      menuPath: "Hardware Monitor → Fan Control",
      steps: [
        "Go to 'Hardware Monitor' in the BIOS.",
        "Select the fan you want to adjust.",
        "Switch to 'Manual' mode.",
        "Drag the temperature/speed points to set your custom curve.",
      ],
      notes:
        "MSI Center software in Windows gives a nicer fan curve UI. But BIOS settings persist across OS reinstalls.",
    },
    fastBoot: {
      menuPath: "Settings → Boot → Fast Boot → Disabled",
      steps: [
        "Go to 'Settings' → 'Boot'.",
        "Set 'Fast Boot' to 'Disabled'.",
      ],
    },
    biosUpdate: {
      method: "USB flash",
      utilityName: "M-FLASH",
      menuPath: "M-FLASH (top menu bar)",
      steps: [
        "Download the latest BIOS from MSI's support page for your exact board model.",
        "Extract the BIOS file to a FAT32 USB drive.",
        "Enter BIOS → click 'M-FLASH' in the top toolbar.",
        "The system will reboot into the flash utility.",
        "Select the USB drive and BIOS file, then confirm.",
        "Wait for completion — do NOT power off.",
      ],
      warning:
        "MSI Flash BIOS Button: many MSI boards have a physical button on the rear I/O for BIOS recovery. Useful if an update bricks the board.",
    },
  },

  // ── Gigabyte ────────────────────────────────────────────────────────────
  Gigabyte: {
    brand: "Gigabyte",
    biosName: "Gigabyte UEFI DualBIOS",
    enterKey: "Del",
    xmp: {
      menuPath: "Tweaker → Extreme Memory Profile (X.M.P.) → Profile 1",
      steps: [
        "Press Del at boot to enter BIOS.",
        "Switch to 'Advanced Mode' if in Easy Mode.",
        "Go to the 'Tweaker' tab.",
        "Find 'Extreme Memory Profile (X.M.P.)' or 'EXPO' for AMD.",
        "Select 'Profile 1'.",
        "Press F10 to save and exit.",
      ],
      notes:
        "Gigabyte's Easy Mode also has an XMP/EXPO toggle on the main dashboard screen. Look for the memory speed display and click it to enable.",
    },
    resizableBar: {
      menuPath: "Settings → IO Ports → Above 4G Decoding → Enabled, Re-Size BAR → Enabled",
      steps: [
        "Go to 'Settings' → 'IO Ports'.",
        "Enable 'Above 4G Decoding'.",
        "Enable 'Re-Size BAR Support' (appears after enabling Above 4G).",
        "Save and exit.",
      ],
    },
    powerLimits: {
      menuPath: "Tweaker → Advanced CPU Settings",
      steps: [
        "Go to 'Tweaker' → 'Advanced CPU Settings'.",
        "For Intel: Adjust PL1, PL2, and 'Current Excursion Protection'.",
        "For AMD: Enable 'Precision Boost Overdrive' and set limits.",
      ],
    },
    virtualization: {
      menuPath: "Tweaker → Advanced CPU Settings → VT-x / SVM → Enabled",
      steps: [
        "Go to 'Tweaker' → 'Advanced CPU Settings'.",
        "Find 'Intel VT-x' or 'SVM Mode'. Set to 'Enabled'.",
      ],
    },
    secureBoot: {
      menuPath: "Boot → Secure Boot → Secure Boot Enable → Enabled",
      steps: [
        "Go to 'Boot' → 'Secure Boot'.",
        "Set 'Secure Boot Enable' to 'Enabled'.",
        "May need to set CSM to 'Disabled' first for Secure Boot to work.",
      ],
    },
    fanCurve: {
      menuPath: "Smart Fan 6 (or Smart Fan 5)",
      steps: [
        "Go to 'Smart Fan 6' (or 'Smart Fan 5' on older boards).",
        "Select the fan header to configure.",
        "Choose 'Manual' mode and adjust the curve points.",
      ],
      notes:
        "Gigabyte's SIV (System Information Viewer) software in Windows also controls fan curves, but BIOS is more reliable.",
    },
    fastBoot: {
      menuPath: "Boot → Fast Boot → Disabled",
      steps: [
        "Go to 'Boot' tab.",
        "Set 'Fast Boot' to 'Disabled'.",
      ],
    },
    biosUpdate: {
      method: "USB flash",
      utilityName: "Q-Flash",
      menuPath: "Press F8 at POST or BIOS → Q-Flash",
      steps: [
        "Download the latest BIOS from Gigabyte's support page.",
        "Extract to a FAT32 USB drive.",
        "Press F8 during POST to enter Q-Flash, or find it in the BIOS.",
        "Select 'Update BIOS'.",
        "Choose the USB drive and BIOS file.",
        "Wait for completion.",
      ],
      warning:
        "Gigabyte DualBIOS: if a BIOS update fails, the backup BIOS chip will automatically restore. This is a safety net most other brands don't have.",
    },
  },

  // ── ASRock ──────────────────────────────────────────────────────────────
  ASRock: {
    brand: "ASRock",
    biosName: "ASRock UEFI BIOS",
    enterKey: "F2 or Del",
    xmp: {
      menuPath: "OC Tweaker → DRAM Configuration → Load XMP Setting → XMP 1",
      steps: [
        "Press F2 or Del at boot.",
        "Go to 'OC Tweaker' tab.",
        "Find 'Load XMP Setting'.",
        "Select 'XMP 1.0 Profile 1' (or EXPO for AMD).",
        "Press F10 to save and exit.",
      ],
      notes:
        "ASRock's EZ Mode has an 'XMP' button on the main screen for quick toggle. For AMD boards, look for 'EXPO' instead.",
    },
    resizableBar: {
      menuPath: "Advanced → PCI Configuration → Above 4G Decoding → Enabled, Re-Size BAR → Enabled",
      steps: [
        "Go to 'Advanced' → 'PCI Configuration'.",
        "Enable 'Above 4G Decoding'.",
        "Enable 'Re-Size BAR Support'.",
        "For Intel 10th/11th gen: also check 'C.A.M. (Clever Access Memory)' is enabled.",
        "Save and exit.",
      ],
    },
    powerLimits: {
      menuPath: "OC Tweaker → CPU Configuration",
      steps: [
        "Go to 'OC Tweaker'.",
        "For Intel: Find 'PL1' and 'PL2' power limits under CPU settings.",
        "For AMD: Find 'PBO' settings and adjust PPT/TDC/EDC.",
        "ASRock also has 'Base Frequency Boost' on some boards — this raises PL1 for sustained performance.",
      ],
    },
    virtualization: {
      menuPath: "Advanced → CPU Configuration → Intel VT / SVM → Enabled",
      steps: [
        "Go to 'Advanced' → 'CPU Configuration'.",
        "Find 'Intel Virtualization Technology' or 'SVM Mode'.",
        "Set to 'Enabled'.",
      ],
    },
    secureBoot: {
      menuPath: "Security → Secure Boot → Secure Boot → Enabled",
      steps: [
        "Go to 'Security' tab → 'Secure Boot'.",
        "Set to 'Enabled'.",
        "May need to install default keys if no keys are enrolled.",
      ],
    },
    fanCurve: {
      menuPath: "H/W Monitor → Fan Configuration",
      steps: [
        "Go to 'H/W Monitor' tab.",
        "Find 'Fan Configuration'.",
        "Set fan mode to 'Customize' and adjust the temperature/speed curve.",
      ],
    },
    fastBoot: {
      menuPath: "Boot → Fast Boot → Disabled",
      steps: [
        "Go to 'Boot' tab.",
        "Set 'Fast Boot' to 'Disabled'.",
      ],
    },
    biosUpdate: {
      method: "USB flash",
      utilityName: "Instant Flash",
      menuPath: "Tool → Instant Flash",
      steps: [
        "Download the latest BIOS from ASRock's support page.",
        "Place the BIOS file on a FAT32 USB drive.",
        "Enter BIOS → 'Tool' → 'Instant Flash'.",
        "Select the BIOS file and confirm.",
        "Wait for the update to complete.",
      ],
      warning:
        "ASRock boards do NOT typically have a hardware flashback button. If a BIOS update fails, recovery requires a working CPU.",
    },
  },

  // ── EVGA ────────────────────────────────────────────────────────────────
  EVGA: {
    brand: "EVGA",
    biosName: "EVGA UEFI BIOS",
    enterKey: "Del",
    xmp: {
      menuPath: "Memory → Memory Profiles → XMP Profile 1",
      steps: [
        "Press Del at boot.",
        "Go to 'Memory' section.",
        "Find 'Memory Profiles' or 'XMP'.",
        "Select Profile 1.",
        "Save and exit.",
      ],
      notes:
        "EVGA exited the motherboard market in 2022. If you have an EVGA board, BIOS updates are no longer being released.",
    },
    resizableBar: {
      menuPath: "Advanced → PCI Configuration → Above 4G Decoding → Enabled",
      steps: [
        "Go to 'Advanced' → 'PCI Configuration'.",
        "Enable 'Above 4G Decoding' and 'Re-Size BAR'.",
      ],
    },
    powerLimits: {
      menuPath: "Advanced → CPU Configuration → Power Limits",
      steps: [
        "Go to 'Advanced' → 'CPU Configuration'.",
        "Adjust power limits as needed.",
      ],
    },
    virtualization: {
      menuPath: "Advanced → CPU Configuration → VT-x → Enabled",
      steps: [
        "Go to 'Advanced' → 'CPU Configuration'.",
        "Enable 'Intel Virtualization Technology'.",
      ],
    },
    secureBoot: {
      menuPath: "Boot → Secure Boot → Enabled",
      steps: ["Go to 'Boot' → 'Secure Boot' → 'Enabled'."],
    },
    fanCurve: {
      menuPath: "Advanced → Fan Control",
      steps: ["Navigate to fan settings and adjust manually."],
    },
    fastBoot: {
      menuPath: "Boot → Fast Boot → Disabled",
      steps: ["Go to 'Boot' → disable 'Fast Boot'."],
    },
    biosUpdate: {
      method: "USB flash",
      utilityName: "EVGA E-LEET / BIOS Flash",
      menuPath: "BIOS update utility in BIOS menu",
      steps: [
        "EVGA exited the motherboard business in 2022.",
        "Final BIOS versions are available on EVGA.com/support (while site lasts).",
        "Use the built-in BIOS flash utility with a FAT32 USB drive.",
      ],
      warning:
        "EVGA no longer makes motherboards. No further BIOS updates will be released. Consider upgrading to a supported platform.",
    },
  },

  // ── NZXT ────────────────────────────────────────────────────────────────
  NZXT: {
    brand: "NZXT",
    biosName: "NZXT BIOS (ASRock-based)",
    enterKey: "Del or F2",
    xmp: {
      menuPath: "OC Tweaker → Load XMP Setting → XMP Profile 1",
      steps: [
        "Press Del or F2 at boot.",
        "Go to 'OC Tweaker'.",
        "Enable XMP/EXPO profile.",
        "Save and exit.",
      ],
      notes:
        "NZXT motherboards are manufactured by ASRock. The BIOS layout is nearly identical to ASRock boards with NZXT branding.",
    },
    resizableBar: {
      menuPath: "Advanced → PCI Configuration → Above 4G / Re-Size BAR → Enabled",
      steps: [
        "Go to 'Advanced' → 'PCI Configuration'.",
        "Enable 'Above 4G Decoding' and 'Re-Size BAR'.",
      ],
    },
    powerLimits: {
      menuPath: "OC Tweaker → CPU Configuration",
      steps: ["Same as ASRock — go to 'OC Tweaker' and adjust power limits."],
    },
    virtualization: {
      menuPath: "Advanced → CPU Configuration → VT / SVM → Enabled",
      steps: [
        "Go to 'Advanced' → 'CPU Configuration'.",
        "Enable virtualization.",
      ],
    },
    secureBoot: {
      menuPath: "Security → Secure Boot → Enabled",
      steps: ["Go to 'Security' → enable 'Secure Boot'."],
    },
    fanCurve: {
      menuPath: "H/W Monitor → Fan Configuration",
      steps: [
        "Fan control is best managed through NZXT CAM software.",
        "BIOS fan settings are under 'H/W Monitor' if you prefer firmware-level control.",
      ],
    },
    fastBoot: {
      menuPath: "Boot → Fast Boot → Disabled",
      steps: ["Go to 'Boot' → disable 'Fast Boot'."],
    },
    biosUpdate: {
      method: "USB flash",
      utilityName: "Instant Flash",
      menuPath: "Tool → Instant Flash",
      steps: [
        "Download BIOS from NZXT support page.",
        "Use FAT32 USB drive.",
        "Enter BIOS → 'Tool' → 'Instant Flash'.",
      ],
      warning: "NZXT boards are ASRock-based. The update process is identical to ASRock.",
    },
  },

  // ── Biostar ─────────────────────────────────────────────────────────────
  Biostar: {
    brand: "Biostar",
    biosName: "Biostar UEFI BIOS",
    enterKey: "Del",
    xmp: {
      menuPath: "O.N.E. → Memory Configuration → Load XMP → Profile 1",
      steps: [
        "Press Del at boot.",
        "Go to 'O.N.E.' (Overclocking Navigator Engine) tab.",
        "Find 'Memory Configuration' → 'Load XMP Setting'.",
        "Select 'Profile 1'.",
        "Save and exit.",
      ],
    },
    resizableBar: {
      menuPath: "Chipset → Above 4G Decoding → Enabled, Re-Size BAR → Enabled",
      steps: [
        "Go to 'Chipset' settings.",
        "Enable 'Above 4G Decoding' and 'Re-Size BAR'.",
      ],
    },
    powerLimits: {
      menuPath: "O.N.E. → CPU Configuration",
      steps: ["Go to 'O.N.E.' → adjust CPU power limits."],
    },
    virtualization: {
      menuPath: "Advanced → CPU Configuration → VT / SVM → Enabled",
      steps: ["Go to 'Advanced' → 'CPU Configuration' → enable virtualization."],
    },
    secureBoot: {
      menuPath: "Security → Secure Boot → Enabled",
      steps: ["Go to 'Security' → enable 'Secure Boot'."],
    },
    fanCurve: {
      menuPath: "H/W Monitor → Smart Fan",
      steps: ["Go to 'H/W Monitor' → configure fan curves."],
    },
    fastBoot: {
      menuPath: "Boot → Fast Boot → Disabled",
      steps: ["Go to 'Boot' → disable 'Fast Boot'."],
    },
    biosUpdate: {
      method: "USB flash",
      utilityName: "BIOS Update Utility",
      menuPath: "BIOS flash utility in BIOS menu",
      steps: [
        "Download BIOS from Biostar support.",
        "Place on FAT32 USB.",
        "Use the built-in flash utility.",
      ],
      warning: "Biostar boards typically don't have BIOS flashback buttons. Ensure stable power during updates.",
    },
  },
};

// ─── Generic Fallback Guide ─────────────────────────────────────────────────

const GENERIC_GUIDE: BIOSGuide = {
  brand: "ASUS", // placeholder, won't be used
  biosName: "UEFI BIOS",
  enterKey: "Del, F2, or F12 (varies by manufacturer)",
  xmp: {
    menuPath: "Look for XMP, D.O.C.P., EXPO, or A-XMP in the overclocking or memory section",
    steps: [
      "Restart your PC and press Del, F2, or F12 repeatedly at the boot screen to enter BIOS.",
      "Look for an 'Overclocking', 'OC', 'Tweaker', or 'AI Tweaker' section.",
      "Find the XMP, D.O.C.P., or EXPO setting.",
      "Select 'Profile 1' or 'Enabled'.",
      "Save and exit (usually F10).",
    ],
    notes:
      "XMP is Intel's name. AMD calls it D.O.C.P. (older) or EXPO (newer Zen 4+). They do the same thing — run your RAM at its rated speed.",
  },
  resizableBar: {
    menuPath: "Look for 'Above 4G Decoding' and 'Re-Size BAR' in Advanced or PCI settings",
    steps: [
      "Enter BIOS and find the 'Advanced' or 'PCI' settings section.",
      "Enable 'Above 4G Decoding' first.",
      "Then enable 'Re-Size BAR Support' or 'Clever Access Memory (CAM)'.",
      "Save and exit.",
    ],
  },
  powerLimits: {
    menuPath: "Overclocking → CPU power limits (PL1/PL2 for Intel, PBO for AMD)",
    steps: [
      "Find CPU power management settings in the OC section.",
      "For Intel: raise PL1 and PL2 to your cooler's capability.",
      "For AMD: enable PBO (Precision Boost Overdrive).",
    ],
  },
  virtualization: {
    menuPath: "Advanced → CPU Configuration → VT-x (Intel) or SVM (AMD) → Enabled",
    steps: [
      "Enter BIOS → find CPU settings.",
      "Enable 'Intel Virtualization Technology' or 'SVM Mode'.",
    ],
  },
  secureBoot: {
    menuPath: "Boot or Security → Secure Boot → Enabled",
    steps: [
      "Find Secure Boot in the Boot or Security section.",
      "Enable it. May need to disable CSM (Legacy Boot) first.",
    ],
  },
  fanCurve: {
    menuPath: "Hardware Monitor or Fan Control section in BIOS",
    steps: [
      "Find the fan control section in your BIOS.",
      "Set to 'Manual' or 'Custom' mode.",
      "Adjust the temperature-to-speed curve.",
    ],
  },
  fastBoot: {
    menuPath: "Boot → Fast Boot → Disabled",
    steps: ["Find Fast Boot in the Boot section and disable it."],
  },
  biosUpdate: {
    method: "USB flash",
    utilityName: "Built-in BIOS flash utility",
    menuPath: "Look for a flash/update option in your BIOS tools section",
    steps: [
      "Download the latest BIOS from your motherboard manufacturer's website.",
      "Put the file on a FAT32-formatted USB drive.",
      "Enter BIOS and find the flash/update utility.",
      "Select the USB drive and BIOS file.",
      "Wait for completion — never power off during the update.",
    ],
    warning:
      "Always read the changelog before updating. If your system is working fine, a BIOS update isn't always necessary. 'If it ain't broke, don't fix it.'",
  },
};
