// ─── Static Upgrade Walkthrough Guides ───────────────────────────────────────
//
// Step-by-step guides for upgrading CPU, GPU, RAM, and Storage.
// Phase 5 (BIOS) is generated dynamically via buildBIOSPhase().

import type { UpgradeGuide, UpgradePhase, UpgradeCategory } from "@/lib/types";
import { getBIOSGuide } from "@/data/bios-guides";

// ─── Guide Lookup ────────────────────────────────────────────────────────────

const GUIDES: Record<UpgradeCategory, UpgradeGuide> = {
  cpu: CPU_GUIDE(),
  gpu: GPU_GUIDE(),
  ram: RAM_GUIDE(),
  storage: STORAGE_GUIDE(),
};

export function getUpgradeGuide(category: UpgradeCategory): UpgradeGuide {
  return GUIDES[category];
}

/**
 * Build the dynamic BIOS configuration phase based on the user's motherboard.
 * Merges brand-specific menu paths into generic BIOS step instructions.
 */
export function buildBIOSPhase(
  category: UpgradeCategory,
  motherboardModel: string,
): UpgradePhase {
  const guide = getBIOSGuide(motherboardModel);

  const baseSteps = {
    cpu: [
      {
        id: "bios-cpu-detect",
        title: "Verify CPU is detected in BIOS",
        description: `Press ${guide.enterKey} at boot to enter ${guide.biosName}. The main screen should show your new CPU model and core count.`,
        warning: "If the BIOS doesn't POST or shows an error, the CPU may not be compatible with your current BIOS version. You may need to flash an older BIOS or update first.",
      },
      {
        id: "bios-cpu-power",
        title: "Configure CPU power limits",
        description: `Navigate to ${guide.powerLimits.menuPath}. For Intel, set PL1/PL2 to your cooler's capability. For AMD, enable PBO (Precision Boost Overdrive) for automatic tuning.`,
        detail: guide.powerLimits.steps.join(" → "),
        tip: "Start with default/auto settings first. Only adjust power limits after confirming the CPU runs stable at stock settings.",
      },
      {
        id: "bios-cpu-xmp",
        title: "Re-enable XMP/EXPO",
        description: `After a CPU swap, BIOS resets to defaults. Re-enable your RAM profile: ${guide.xmp.menuPath}.`,
        tip: guide.xmp.notes,
      },
    ],
    gpu: [
      {
        id: "bios-gpu-rebar",
        title: "Enable Resizable BAR",
        description: `Navigate to ${guide.resizableBar.menuPath}. This lets your CPU access the full GPU VRAM at once for a free 0-10% FPS boost.`,
        detail: guide.resizableBar.steps.join(" → "),
        tip: "After enabling in BIOS, also enable it in your GPU driver (NVIDIA Control Panel → Manage 3D Settings or AMD Adrenalin → Performance → Tuning).",
      },
    ],
    ram: [
      {
        id: "bios-ram-xmp",
        title: "Enable XMP/EXPO profile",
        description: `This is critical — without it, your new RAM runs at slow default speeds. Navigate to ${guide.xmp.menuPath} and select Profile 1.`,
        detail: guide.xmp.steps.join(" → "),
        warning: "If your system won't boot after enabling XMP, clear CMOS (check your motherboard manual) and try a lower XMP profile or manually set a speed one step below rated.",
        tip: guide.xmp.notes,
      },
      {
        id: "bios-ram-verify-speed",
        title: "Verify RAM speed in BIOS",
        description: "After saving and rebooting, re-enter BIOS and check the main info screen. It should show your RAM at its rated speed (e.g., 3600 MHz, 6000 MHz) rather than the default JEDEC speed.",
      },
    ],
    storage: [
      {
        id: "bios-storage-boot",
        title: "Set boot priority",
        description: `If you installed an OS on the new drive, set it as the first boot device. Go to the Boot tab in ${guide.biosName} and move your new drive to the top of the boot order.`,
        tip: "If you cloned your old drive, you may also need to set the new drive as the boot target and remove the old one from the boot list to avoid confusion.",
      },
    ],
  };

  return {
    id: "phase-bios",
    title: "BIOS Configuration",
    steps: baseSteps[category],
  };
}

// ─── CPU Guide ───────────────────────────────────────────────────────────────

function CPU_GUIDE(): UpgradeGuide {
  return {
    category: "cpu",
    title: "CPU Upgrade Guide",
    estimatedTime: "45-90 minutes",
    difficulty: "Intermediate",
    phases: [
      {
        id: "phase-pre",
        title: "Pre-Upgrade Checklist",
        steps: [
          {
            id: "cpu-pre-tools",
            title: "Gather your tools",
            description: "You'll need a Phillips-head screwdriver, thermal paste (Arctic MX-6 or Noctua NT-H1 are great affordable options), isopropyl alcohol (90%+), and a lint-free cloth or coffee filter.",
            tip: "If your new CPU comes with a cooler in the box (like AMD Wraith), it usually has thermal paste pre-applied. You won't need to buy separate paste unless you're reusing your existing cooler.",
          },
          {
            id: "cpu-pre-socket",
            title: "Verify socket compatibility",
            description: "Check that your new CPU uses the same socket as your motherboard. AM5 CPUs only fit AM5 boards, LGA1700 only fits 12th/13th/14th gen Intel boards, etc. This is the most important compatibility check.",
            warning: "If you're upgrading to a different socket (e.g., going from Intel to AMD), you'll also need a new motherboard — and potentially new RAM if switching from DDR4 to DDR5.",
          },
          {
            id: "cpu-pre-bios",
            title: "Check BIOS compatibility",
            description: "Visit your motherboard manufacturer's website, find your board model, and check the CPU support list. Newer CPUs on the same socket sometimes need a BIOS update to work.",
            detail: "Example: An AMD B650 board may need a BIOS update to support Ryzen 9000 series even though they use the same AM5 socket. The update must be done BEFORE swapping CPUs. If your board has BIOS Flashback (a button on the rear I/O), you can update without a working CPU installed.",
          },
          {
            id: "cpu-pre-backup",
            title: "Create a restore point",
            description: "Open Windows Search → type 'Create a restore point' → click 'Create' → name it 'Before CPU upgrade'. This gives you a rollback option if drivers cause issues.",
          },
          {
            id: "cpu-pre-drivers",
            title: "Download chipset drivers",
            description: "If switching platforms (Intel ↔ AMD), download the new chipset drivers ahead of time so you can install them right after the swap. Get them from AMD.com or Intel.com, not third-party sites.",
          },
        ],
      },
      {
        id: "phase-shop",
        title: "Shopping Tips",
        steps: [
          {
            id: "cpu-shop-priority",
            title: "Prioritize gaming score per dollar",
            description: "For gaming, single-threaded performance matters more than core count. An 8-core CPU with fast clocks (like Ryzen 7 7800X3D or i7-14700K) will outperform a 16-core CPU with slower clocks in most games.",
            tip: "The sweet spot for gaming in 2025 is the $200-350 range. Spending $500+ on a CPU gives diminishing returns for gaming specifically.",
          },
          {
            id: "cpu-shop-cooler",
            title: "Don't forget the cooler",
            description: "High-end CPUs (i9, Ryzen 9) run hot and need a beefy cooler. Budget $30-80 for a good tower cooler (Thermalright Peerless Assassin 120, Noctua NH-D15) or $80-150 for an AIO liquid cooler (Arctic Liquid Freezer II).",
            warning: "If switching between Intel and AMD, your existing cooler may need a different mounting bracket. Check if one is included or available from the cooler manufacturer.",
          },
          {
            id: "cpu-shop-where",
            title: "Where to buy",
            description: "Amazon, Newegg, and Micro Center (if nearby) are the best options. Micro Center often has in-store-only deals that beat online prices by $20-50.",
            tip: "Check r/buildapcsales on Reddit — users post deals daily. CPUs go on sale frequently around Black Friday, Prime Day, and product launches.",
          },
          {
            id: "cpu-shop-used",
            title: "Consider previous-gen used CPUs",
            description: "Last-gen CPUs (Ryzen 5000, Intel 12th gen) are excellent value on the used market. A used Ryzen 7 5800X3D for $200 still trades blows with current-gen in gaming.",
            warning: "Only buy used from reputable sellers with return policies (eBay with buyer protection, r/hardwareswap with confirmed trades). Avoid Wish/AliExpress for CPUs.",
          },
        ],
      },
      {
        id: "phase-install",
        title: "Installation",
        steps: [
          {
            id: "cpu-inst-shutdown",
            title: "Power off completely",
            description: "Shut down Windows fully (not sleep/hibernate). Flip the PSU switch on the back to OFF. Unplug the power cable from the wall. Press the power button once to drain residual power.",
            warning: "Always work on a non-carpeted surface. Touch the metal case frame before handling any components to discharge static electricity.",
          },
          {
            id: "cpu-inst-open",
            title: "Open the case",
            description: "Remove the side panel (usually 2 thumbscrews on the back). Set it aside carefully.",
          },
          {
            id: "cpu-inst-cooler-remove",
            title: "Remove the CPU cooler",
            description: "Unplug the CPU fan cable from the motherboard header. For tower coolers, unscrew in a cross/diagonal pattern to release evenly. For AIOs, unscrew the mounting bracket. Set the cooler aside with the thermal paste side facing up.",
            detail: "If the cooler feels stuck, gently twist it side to side first. Never pull straight up — this can rip the CPU out of the socket (especially on AMD AM4/AM5 where the CPU has pins).",
            tip: "Take a photo of the fan cable location before unplugging so you know where to reconnect later.",
          },
          {
            id: "cpu-inst-clean",
            title: "Clean old thermal paste",
            description: "Apply a small amount of isopropyl alcohol to the lint-free cloth and gently wipe the old thermal paste off the CPU and the bottom of the cooler. Clean until both surfaces are smooth and shiny.",
          },
          {
            id: "cpu-inst-remove-cpu",
            title: "Remove the old CPU",
            description: "Intel (LGA): Lift the retention arm, then lift the metal load plate. The CPU will lift straight out — no force needed. AMD (AM4/AM5 PGA): Lift the lever, then gently lift the CPU straight up by its edges.",
            warning: "Never touch the gold contacts (Intel) or pins (AMD) with your fingers. Hold the CPU by its edges only. Bent pins are very difficult to fix.",
          },
          {
            id: "cpu-inst-insert-cpu",
            title: "Install the new CPU",
            description: "Find the alignment triangle on both the CPU and the socket — they must match. Gently place the CPU into the socket. It should drop in with zero force. Intel: lower the load plate and press the lever down. AMD: lower the lever to lock.",
            warning: "If the CPU doesn't drop in easily, DO NOT force it. Remove it and check the alignment triangle. Forcing a CPU into the wrong orientation will bend pins and destroy the socket.",
          },
          {
            id: "cpu-inst-paste",
            title: "Apply thermal paste",
            description: "Apply a small pea-sized dot (about the size of a grain of rice) of thermal paste to the center of the CPU. Don't spread it — the cooler's mounting pressure will do that.",
            tip: "More is not better. Too much paste can spill over the edges. A pea-sized amount provides optimal coverage for most CPUs.",
          },
          {
            id: "cpu-inst-cooler-mount",
            title: "Mount the CPU cooler",
            description: "Align the cooler over the CPU and press down evenly. Tighten screws in a diagonal (cross) pattern — a few turns each, alternating, until finger-tight. Reconnect the fan cable to the CPU_FAN header.",
            detail: "For tower coolers, make sure the heatpipes face the correct direction (usually towards the rear exhaust fan) and that the cooler doesn't block RAM slots. If it does, you may need to orient it differently or use low-profile RAM.",
          },
          {
            id: "cpu-inst-close",
            title: "Close up and reconnect",
            description: "Double-check all cable connections. Replace the side panel. Plug in the power cable and flip the PSU switch back to ON.",
          },
        ],
      },
      {
        id: "phase-verify",
        title: "Post-Upgrade Verification",
        steps: [
          {
            id: "cpu-verify-post",
            title: "First boot — watch for POST",
            description: "Press the power button. The motherboard should POST (you'll see the brand logo or a diagnostic screen). If nothing appears, power off and reseat the CPU and RAM.",
            warning: "If your board has debug LEDs (small lights near the 24-pin connector), check which one is lit if it won't boot: CPU, DRAM, VGA, or BOOT. This tells you what to troubleshoot.",
          },
          {
            id: "cpu-verify-bios",
            title: "Check BIOS detection",
            description: "Enter BIOS to confirm the new CPU model name, core count, and clock speed are showing correctly on the main info screen.",
          },
          {
            id: "cpu-verify-windows",
            title: "Boot into Windows",
            description: "Windows should detect the new CPU automatically and load appropriate drivers. You may see a 'Setting up devices' message on first boot — let it finish.",
          },
          {
            id: "cpu-verify-devmgr",
            title: "Check Device Manager",
            description: "Right-click Start → Device Manager → expand 'Processors'. You should see your new CPU model listed for each logical core. No yellow warning triangles should appear.",
          },
          {
            id: "cpu-verify-drivers",
            title: "Install chipset drivers",
            description: "If you switched platforms, install the chipset drivers you downloaded earlier. Restart when prompted. For same-platform upgrades, drivers usually carry over fine.",
          },
          {
            id: "cpu-verify-bench",
            title: "Run a quick benchmark",
            description: "Run Cinebench R23 (free) or CPU-Z's built-in benchmark. Compare your score to online results for your CPU model to make sure performance is where it should be. Also monitor temperatures — anything under 85°C under full load is fine.",
            tip: "If temps are unusually high (90°C+ under Cinebench), the cooler may not be seated properly or thermal paste application was insufficient. Re-mount the cooler.",
          },
        ],
      },
      // Phase 5 (BIOS) is added dynamically via buildBIOSPhase()
    ],
  };
}

// ─── GPU Guide ───────────────────────────────────────────────────────────────

function GPU_GUIDE(): UpgradeGuide {
  return {
    category: "gpu",
    title: "GPU Upgrade Guide",
    estimatedTime: "30-60 minutes",
    difficulty: "Beginner",
    phases: [
      {
        id: "phase-pre",
        title: "Pre-Upgrade Checklist",
        steps: [
          {
            id: "gpu-pre-tools",
            title: "Gather your tools",
            description: "You only need a Phillips-head screwdriver. GPU swaps are one of the simplest upgrades.",
          },
          {
            id: "gpu-pre-psu",
            title: "Check your PSU wattage",
            description: "Look at the label on your power supply (usually visible through the case or by opening the side panel). Budget GPUs (RTX 4060, RX 7600) need 450W+. Mid-range (RTX 4070, RX 7800 XT) needs 550W+. High-end (RTX 4080+, RX 7900 XT) needs 750W+.",
            warning: "If your PSU doesn't have enough wattage, the system may crash under load or not boot at all. PSU upgrades are relatively cheap ($60-100 for a quality 750W unit).",
          },
          {
            id: "gpu-pre-connectors",
            title: "Check power connectors",
            description: "Count the PCIe power cables from your PSU. Budget GPUs need one 8-pin. Mid-range needs one or two 8-pins. The RTX 4090/5090 uses a 16-pin 12VHPWR connector (adapter usually included in the box).",
            tip: "Never use a single cable with a daisy-chained splitter for high-end GPUs. Use separate cables from the PSU for each connector to ensure stable power delivery.",
          },
          {
            id: "gpu-pre-size",
            title: "Measure your case clearance",
            description: "Modern GPUs are large. Measure the distance from your PCIe slot to the front of your case (for length) and from the motherboard to the side panel (for thickness). Check the GPU's specs for dimensions.",
            detail: "Most mid-tower cases support GPUs up to 300-350mm long. Some high-end GPUs (RTX 4090, RX 7900 XTX) are 330mm+ and 3+ slots thick. If it won't fit, you may need to remove a drive cage or get a larger case.",
          },
          {
            id: "gpu-pre-drivers",
            title: "Uninstall old GPU drivers",
            description: "Download DDU (Display Driver Uninstaller) from guru3d.com. Boot into Safe Mode, run DDU, select 'Clean and shut down'. This prevents driver conflicts between old and new GPUs.",
            tip: "If switching between NVIDIA and AMD, this step is especially important. Leftover drivers from the other brand will cause issues.",
          },
          {
            id: "gpu-pre-newdrivers",
            title: "Download new GPU drivers",
            description: "Download the latest drivers for your NEW GPU from nvidia.com/drivers or amd.com/drivers. Save them to a USB drive or your desktop so you can install them right after the swap.",
          },
        ],
      },
      {
        id: "phase-shop",
        title: "Shopping Tips",
        steps: [
          {
            id: "gpu-shop-priority",
            title: "Match your resolution",
            description: "1080p gaming: RTX 4060 / RX 7600 ($250-300). 1440p gaming: RTX 4070 Super / RX 7800 XT ($400-500). 4K gaming: RTX 4080 Super / RX 7900 XTX ($700-1000). Buying more GPU than your monitor can use is wasted money.",
          },
          {
            id: "gpu-shop-vram",
            title: "VRAM matters more than ever",
            description: "8 GB VRAM is the minimum for 2025. 12 GB is comfortable. 16 GB is future-proof. Games like The Last of Us, Hogwarts Legacy, and Alan Wake 2 can use 10+ GB at high settings.",
            warning: "Avoid 4 GB GPUs entirely — they struggle with modern games even at 1080p low settings.",
          },
          {
            id: "gpu-shop-used",
            title: "Used GPUs can be great deals",
            description: "Previous-gen cards (RTX 3070, 3080, RX 6800 XT) are excellent value used. An RTX 3080 for $250-300 is hard to beat at 1440p.",
            tip: "When buying used, ask for a benchmark screenshot (3DMark/Furmark) to verify the card works under load. Avoid cards from crypto mining farms — they've been running 24/7 for years.",
          },
          {
            id: "gpu-shop-where",
            title: "Where to buy",
            description: "Amazon, Newegg, Best Buy, and Micro Center for new. eBay (with buyer protection) and r/hardwareswap for used. EVGA B-Stock is no longer available since EVGA left the GPU market.",
          },
          {
            id: "gpu-shop-avoid",
            title: "What to avoid",
            description: "Don't buy the cheapest model of any GPU (single-fan, no backplate). They run hot and loud. Spend $10-20 more for a dual-fan model from ASUS, MSI, or Gigabyte for much better cooling and noise levels.",
          },
        ],
      },
      {
        id: "phase-install",
        title: "Installation",
        steps: [
          {
            id: "gpu-inst-shutdown",
            title: "Power off completely",
            description: "Shut down Windows. Flip the PSU switch to OFF. Unplug the power cable. Press the power button to drain residual charge. Ground yourself by touching the metal case frame.",
          },
          {
            id: "gpu-inst-open",
            title: "Open the case and locate the GPU",
            description: "Remove the side panel. Your current GPU is the large card plugged into the top PCIe slot, secured with screws at the back of the case.",
          },
          {
            id: "gpu-inst-disconnect",
            title: "Disconnect power cables from old GPU",
            description: "Unplug the PCIe power cable(s) from the GPU. Squeeze the clip and pull firmly — they can be tight.",
          },
          {
            id: "gpu-inst-remove",
            title: "Remove the old GPU",
            description: "Unscrew the bracket screw(s) at the back of the case. Find the PCIe retention latch at the end of the slot (near the front of the motherboard) — push or flip it to release. Pull the GPU straight out.",
            warning: "The PCIe latch is small and can be hard to reach, especially with large cards. Use a pen or small screwdriver to push it if your fingers don't fit. Never force the card out without releasing the latch — you'll damage the slot.",
          },
          {
            id: "gpu-inst-insert",
            title: "Install the new GPU",
            description: "Remove any protective covers from the new GPU's PCIe connector. Align it with the PCIe x16 slot (the top long slot) and press firmly down until the retention latch clicks. You should hear/feel it snap into place.",
            tip: "If the card feels like it's not going in, check that the I/O bracket lines up with the case slot opening and that no cables are in the way.",
          },
          {
            id: "gpu-inst-secure",
            title: "Secure and connect power",
            description: "Screw in the bracket screw(s) to hold the GPU firmly. Connect the PCIe power cable(s) — make sure each connector clicks in fully. For multi-connector GPUs, use separate cables from the PSU (not a daisy chain).",
          },
          {
            id: "gpu-inst-close",
            title: "Close up and boot",
            description: "Make sure your display cable (HDMI/DP) is plugged into the NEW GPU (not the motherboard I/O). Replace the side panel. Plug in power, flip PSU switch to ON, and press the power button.",
            warning: "A very common mistake: plugging the display cable into the motherboard instead of the GPU. The motherboard outputs use your CPU's integrated graphics (if it has one), not the dedicated GPU.",
          },
        ],
      },
      {
        id: "phase-verify",
        title: "Post-Upgrade Verification",
        steps: [
          {
            id: "gpu-verify-post",
            title: "Watch for display output",
            description: "The screen should show the motherboard POST screen within 10-30 seconds. If no display appears, power off and reseat the GPU — press it firmly into the slot until the latch clicks.",
          },
          {
            id: "gpu-verify-windows",
            title: "Boot into Windows",
            description: "Windows will load with a basic display driver. Resolution may look off — that's normal until you install the proper driver.",
          },
          {
            id: "gpu-verify-drivers",
            title: "Install GPU drivers",
            description: "Run the driver installer you downloaded earlier (or download fresh from nvidia.com or amd.com). Select 'Custom install' and check 'Clean install' to ensure no leftover settings from the old GPU. Restart when prompted.",
          },
          {
            id: "gpu-verify-devmgr",
            title: "Verify in Device Manager",
            description: "Right-click Start → Device Manager → expand 'Display adapters'. Your new GPU should appear with no yellow warning icons.",
          },
          {
            id: "gpu-verify-bench",
            title: "Run a benchmark",
            description: "Run 3DMark Time Spy (free version on Steam) or Unigine Heaven. Compare your score to published results for your GPU model. If the score is significantly low, check that you connected all power cables.",
            tip: "Also check GPU-Z (free) to verify the GPU is running at PCIe x16 (not x8 or x4) and that the core/memory clocks match the expected specs.",
          },
          {
            id: "gpu-verify-temps",
            title: "Monitor temperatures",
            description: "Run a game or Furmark for 10 minutes while watching temps with MSI Afterburner or GPU-Z. The GPU should stay under 85°C. If it's hitting 90°C+, case airflow may be insufficient.",
          },
        ],
      },
    ],
  };
}

// ─── RAM Guide ───────────────────────────────────────────────────────────────

function RAM_GUIDE(): UpgradeGuide {
  return {
    category: "ram",
    title: "RAM Upgrade Guide",
    estimatedTime: "15-30 minutes",
    difficulty: "Beginner",
    phases: [
      {
        id: "phase-pre",
        title: "Pre-Upgrade Checklist",
        steps: [
          {
            id: "ram-pre-tools",
            title: "No tools needed",
            description: "RAM installs are tool-free. The sticks click into place with finger pressure. This is the easiest PC upgrade you can do.",
          },
          {
            id: "ram-pre-ddr",
            title: "Check DDR generation",
            description: "DDR4 and DDR5 are physically different and NOT interchangeable. Your motherboard supports one or the other — never both. Check your current RAM's form factor to know which to buy.",
            warning: "A DDR5 stick will not physically fit in a DDR4 slot (the notch is in a different position). If it doesn't slide in easily, you have the wrong type.",
          },
          {
            id: "ram-pre-slots",
            title: "Check available slots",
            description: "Most motherboards have 2 or 4 RAM slots. If all slots are full, you'll need to replace existing sticks rather than add more.",
            tip: "For 4-slot boards, the optimal configuration is 2 sticks in slots 2 and 4 (counting from the CPU). Check your motherboard manual for the recommended slots.",
          },
          {
            id: "ram-pre-speed",
            title: "Match speeds if adding",
            description: "If adding a stick to an existing one, get the same speed, capacity, and ideally the same model. Mixing RAM brands can work but may force both sticks to run at the slower stick's speed.",
            tip: "If upgrading from 2x8 GB to 2x16 GB, it's better to buy a matched kit (sold together) rather than two individual sticks. Matched kits are tested together for stability.",
          },
          {
            id: "ram-pre-max",
            title: "Check your board's max capacity",
            description: "Most modern boards support 64-128 GB total. For gaming, 32 GB (2x16) is the sweet spot. 16 GB (2x8) is the minimum. 64 GB is overkill unless you do video editing or VMs.",
          },
        ],
      },
      {
        id: "phase-shop",
        title: "Shopping Tips",
        steps: [
          {
            id: "ram-shop-speed",
            title: "Recommended speeds",
            description: "DDR4: 3200-3600 MHz is the sweet spot. Anything above 3600 gives diminishing returns. DDR5: 5600-6400 MHz is optimal. Higher speeds help more on Intel than AMD currently.",
          },
          {
            id: "ram-shop-budget",
            title: "Budget allocation",
            description: "RAM is cheap in 2025. DDR4 2x16 GB 3600 CL18: $40-55. DDR5 2x16 GB 6000 CL30: $60-90. Don't overspend on extreme speed RAM — the FPS difference between DDR5-6000 and DDR5-8000 is 2-3% in games.",
            tip: "Samsung B-die (DDR4) and SK Hynix A-die (DDR5) are the best ICs for overclocking, but you don't need them unless you plan to manually tune timings.",
          },
          {
            id: "ram-shop-brand",
            title: "Reliable brands",
            description: "G.Skill, Corsair, Kingston, Crucial, and TeamGroup all make solid RAM. For DDR5, G.Skill Flare X5 and Corsair Vengeance are popular. For DDR4, G.Skill Ripjaws V and Crucial Ballistix are great value.",
          },
          {
            id: "ram-shop-height",
            title: "Check RAM height",
            description: "If you have a large CPU tower cooler, tall RAM heatsinks may not fit. Low-profile RAM (like Corsair Vengeance LPX or Crucial without heatspreaders) is safer if clearance is tight.",
          },
        ],
      },
      {
        id: "phase-install",
        title: "Installation",
        steps: [
          {
            id: "ram-inst-shutdown",
            title: "Power off and open the case",
            description: "Shut down, unplug power, press the power button to drain. Open the side panel. Ground yourself by touching the metal case frame.",
          },
          {
            id: "ram-inst-remove-old",
            title: "Remove old RAM (if replacing)",
            description: "Push down the retention clips on both ends of the RAM slot — the stick will pop up slightly. Pull it straight out. If adding (not replacing), skip this step.",
            tip: "Some motherboards only have a latch on one end. In that case, push just the one latch and the other end lifts from its fixed hook.",
          },
          {
            id: "ram-inst-align",
            title: "Align the new RAM stick",
            description: "Find the notch on the bottom edge of the RAM stick and match it to the ridge in the slot. DDR4 and DDR5 notches are in different positions — if it doesn't line up, you have the wrong generation.",
          },
          {
            id: "ram-inst-insert",
            title: "Press the RAM in firmly",
            description: "With the stick aligned, press straight down with even pressure on both ends until the retention clips snap closed. You'll hear two distinct clicks. It takes more force than you'd expect — be firm but even.",
            warning: "Never force RAM at an angle. It should only go in one way (matching the notch). If it doesn't line up, remove it and try the other orientation — but if the notch is clearly wrong, you have the wrong DDR generation.",
          },
          {
            id: "ram-inst-close",
            title: "Close up and boot",
            description: "Replace the side panel, plug in power, and boot. The system may take a few extra seconds on the first boot as it trains the new memory — this is normal.",
          },
        ],
      },
      {
        id: "phase-verify",
        title: "Post-Upgrade Verification",
        steps: [
          {
            id: "ram-verify-bios",
            title: "Check BIOS for detection",
            description: "Enter BIOS on the first boot. The main screen should show the correct total RAM amount (e.g., 32768 MB = 32 GB) and the number of sticks.",
            warning: "If BIOS shows less RAM than installed, one or more sticks may not be fully seated. Power off and reseat them.",
          },
          {
            id: "ram-verify-channel",
            title: "Verify dual-channel mode",
            description: "In BIOS or using CPU-Z (Memory tab) in Windows, check that the RAM is running in dual-channel mode. If it says single-channel, your sticks are in the wrong slots — move them to slots 2 and 4.",
          },
          {
            id: "ram-verify-speed",
            title: "Check RAM speed",
            description: "Use CPU-Z or Task Manager (Performance → Memory) to check the current speed. If it's showing a lower speed than rated (e.g., 2133 MHz instead of 3600), XMP/EXPO is not enabled.",
          },
          {
            id: "ram-verify-stable",
            title: "Run a memory stress test",
            description: "Run memtest86 (boot from USB) or Windows Memory Diagnostic to check for errors. Let it run for at least 1-2 passes. Any errors mean the RAM is unstable — try lowering the XMP speed or loosening timings.",
            tip: "If you get errors with XMP enabled but not at default speeds, your RAM kit may not be compatible with your specific CPU/motherboard combo at the rated speed. Try one speed step lower.",
          },
          {
            id: "ram-verify-task",
            title: "Verify in Windows",
            description: "Open Task Manager → Performance → Memory. Confirm the total amount matches, speed is correct, and 'Slots used' shows the right count (e.g., 2 of 4).",
          },
        ],
      },
    ],
  };
}

// ─── Storage Guide ───────────────────────────────────────────────────────────

function STORAGE_GUIDE(): UpgradeGuide {
  return {
    category: "storage",
    title: "Storage Upgrade Guide",
    estimatedTime: "20-45 minutes",
    difficulty: "Beginner",
    phases: [
      {
        id: "phase-pre",
        title: "Pre-Upgrade Checklist",
        steps: [
          {
            id: "stor-pre-tools",
            title: "Gather your tools",
            description: "Phillips screwdriver. For M.2 NVMe drives, you may also need the small M.2 standoff screw (usually included with your motherboard or the drive).",
          },
          {
            id: "stor-pre-type",
            title: "Determine your drive type",
            description: "M.2 NVMe: A small stick that plugs directly into the motherboard (fastest, recommended). 2.5\" SATA SSD: A small box that connects via SATA cable (still fast, good for older PCs). 3.5\" HDD: Only for bulk storage, never as a boot drive.",
            tip: "If your motherboard has an M.2 slot (most boards from 2018+ do), always choose NVMe. It's 3-7x faster than SATA for sequential reads and modern games benefit from DirectStorage.",
          },
          {
            id: "stor-pre-slots",
            title: "Check M.2 slot availability",
            description: "Look at your motherboard — M.2 slots are usually between the CPU and GPU, sometimes with a heatsink cover. Most boards have 1-3 M.2 slots. If all are full, you'll need to use SATA or replace an existing drive.",
          },
          {
            id: "stor-pre-backup",
            title: "Back up your data",
            description: "Before any storage changes, back up important files to an external drive or cloud storage. If you're replacing your boot drive, you'll need to either clone it or do a fresh Windows install.",
            warning: "If you're cloning your boot drive, download Macrium Reflect Free or Samsung Data Migration (for Samsung drives) before you start. You'll need the software ready.",
          },
          {
            id: "stor-pre-media",
            title: "Prepare Windows installation media (if needed)",
            description: "If doing a fresh install on the new drive, download the Windows Media Creation Tool from Microsoft and create a bootable USB. You'll need an 8 GB+ USB drive.",
            tip: "A fresh install is cleaner than cloning (no leftover junk) but means reinstalling your apps. Cloning is faster but may carry over issues from the old install.",
          },
        ],
      },
      {
        id: "phase-shop",
        title: "Shopping Tips",
        steps: [
          {
            id: "stor-shop-nvme",
            title: "NVMe SSD recommendations",
            description: "Budget (1 TB, $50-70): WD Blue SN580, Crucial P3 Plus, Kingston NV2. Mid-range (1 TB, $70-100): Samsung 990 EVO, WD Black SN770. High-end (2 TB, $120-180): Samsung 990 Pro, WD Black SN850X.",
            tip: "For gaming, there's almost no real-world difference between a $50 NVMe and a $100 one. The expensive drives only matter for sustained sequential writes (video editing, content creation).",
          },
          {
            id: "stor-shop-sata",
            title: "SATA SSD options",
            description: "If you don't have an M.2 slot, a SATA SSD is still a massive upgrade over an HDD. Samsung 870 EVO and Crucial MX500 are both excellent at $60-80 for 1 TB.",
          },
          {
            id: "stor-shop-capacity",
            title: "How much space do you need?",
            description: "500 GB: Bare minimum for Windows + a few games. 1 TB: Comfortable for most users — OS + 10-15 AAA games. 2 TB: For large game libraries or content creation. 4 TB+: Only if you truly need it.",
          },
          {
            id: "stor-shop-gen",
            title: "PCIe Gen 3 vs Gen 4 vs Gen 5",
            description: "Gen 3 NVMe (3,500 MB/s): Perfectly fine for gaming, cheapest. Gen 4 NVMe (7,000 MB/s): The sweet spot, slightly more expensive. Gen 5 NVMe (12,000+ MB/s): Overkill for most users, runs hot, expensive.",
            tip: "Your motherboard's M.2 slot determines the max speed. A Gen 4 drive in a Gen 3 slot still works, just at Gen 3 speeds. Check your board specs.",
          },
        ],
      },
      {
        id: "phase-install",
        title: "Installation",
        steps: [
          {
            id: "stor-inst-shutdown",
            title: "Power off and open the case",
            description: "Shut down, unplug power, press power button to drain. Open the side panel. Ground yourself on the case frame.",
          },
          {
            id: "stor-inst-locate",
            title: "Locate the M.2 slot or SATA ports",
            description: "M.2 slots are usually on the motherboard between the CPU and GPU, sometimes covered by a heatsink. SATA ports are along the edge of the motherboard.",
            detail: "For M.2: remove the heatsink (usually 1-2 small screws) to expose the slot. For SATA: you'll need a SATA data cable (one usually comes with the motherboard) and a SATA power cable from the PSU.",
          },
          {
            id: "stor-inst-nvme",
            title: "Install M.2 NVMe drive",
            description: "Insert the drive at a 30-degree angle into the M.2 slot (gold contacts first). It'll stick up at an angle. Press the end down flat and secure with the small M.2 screw. Replace the heatsink if your board has one.",
            tip: "Some boards use a tool-less M.2 latch instead of a screw. Check if yours has a flip-up or push-pin mechanism.",
          },
          {
            id: "stor-inst-sata",
            title: "Install SATA SSD (alternative)",
            description: "Mount the 2.5\" SSD in a drive bay or bracket (many cases have dedicated SSD mounts behind the motherboard tray). Connect the SATA data cable to both the drive and motherboard. Connect SATA power from the PSU.",
          },
          {
            id: "stor-inst-os",
            title: "Install or clone Windows (if boot drive)",
            description: "To clone: Connect both old and new drives, boot into Windows, run your cloning software, select source → destination, wait for completion. To fresh install: Boot from the USB media, select the new drive, format, and install.",
            warning: "When cloning, double-check that you selected the correct source and destination drives. Cloning to the wrong drive will destroy its data.",
          },
          {
            id: "stor-inst-close",
            title: "Close up and boot",
            description: "Replace the side panel, plug in power, and boot. If you cloned, remove the old boot drive or set the new one as the primary boot device in BIOS.",
          },
        ],
      },
      {
        id: "phase-verify",
        title: "Post-Upgrade Verification",
        steps: [
          {
            id: "stor-verify-bios",
            title: "Check BIOS detection",
            description: "Enter BIOS and check that the new drive appears in the storage/boot device list. It should show the drive model and capacity.",
            warning: "If the M.2 drive doesn't appear, it may be in a slot that shares bandwidth with a SATA port (disabling that port). Check your motherboard manual for M.2 slot sharing rules.",
          },
          {
            id: "stor-verify-boot",
            title: "Set boot order",
            description: "If this is your new boot drive, set it as the first boot device in BIOS. Save and exit.",
          },
          {
            id: "stor-verify-windows",
            title: "Verify in Windows",
            description: "Open File Explorer — your new drive should appear. If it doesn't show up, open Disk Management (right-click Start → Disk Management) and initialize/format the new drive.",
          },
          {
            id: "stor-verify-speed",
            title: "Run a speed test",
            description: "Download CrystalDiskMark (free). Run the benchmark on the new drive. For NVMe Gen 4, you should see 5,000-7,000 MB/s sequential read. For SATA SSD, expect 500-550 MB/s.",
            tip: "If speeds are much lower than expected, check that the M.2 slot is the right generation (a Gen 4 drive in a Gen 3 slot will max out at ~3,500 MB/s — still fast, but not full speed).",
          },
          {
            id: "stor-verify-health",
            title: "Check drive health",
            description: "Use CrystalDiskInfo (free) to verify the drive reports 'Good' health status and shows the correct model, firmware, and capacity. Set it to auto-start with Windows so you're notified if health degrades.",
          },
          {
            id: "stor-verify-old",
            title: "Wipe or repurpose old drive",
            description: "If you migrated from an old drive, you can either wipe it (Disk Management → right-click → Delete Volume → New Simple Volume) for extra storage, or physically remove it to keep as a backup.",
          },
        ],
      },
    ],
  };
}
