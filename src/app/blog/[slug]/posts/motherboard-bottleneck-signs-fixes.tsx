import { getAmazonLink } from "@/lib/affiliate";
import Link from "next/link";

function A({ name }: { name: string }) {
  return (
    <a
      href={getAmazonLink(name)}
      target="_blank"
      rel="noopener noreferrer sponsored"
    >
      {name}
    </a>
  );
}

export function MotherboardBottleneckSignsFixes() {
  return (
    <>
      <p>
        You&apos;ve upgraded your CPU, GPU, and RAM — but performance still
        isn&apos;t where it should be. Frame rates plateau, transfer speeds
        disappoint, and your shiny new NVMe drive feels no faster than the old
        one. The overlooked culprit? Your{" "}
        <strong>motherboard might be the bottleneck</strong>.
      </p>
      <p>
        Motherboards don&apos;t have a clock speed or a benchmark score, so
        they&apos;re easy to dismiss. But they control every connection between
        your components — and a board that can&apos;t keep up silently caps the
        performance of everything plugged into it. This guide covers the six
        most common ways a motherboard bottlenecks your PC, how to diagnose
        each one, and the best upgrades to fix them.
      </p>

      <h2>1. PCIe Generation Mismatch (PCIe 3.0 vs 4.0 vs 5.0)</h2>
      <p>
        Every modern GPU and NVMe SSD communicates with the CPU through{" "}
        <strong>PCIe lanes</strong>. Each PCIe generation doubles the bandwidth
        of the previous one:
      </p>
      <ul>
        <li>
          <strong>PCIe 3.0 x16:</strong> ~32 GB/s (common on pre-2020 boards)
        </li>
        <li>
          <strong>PCIe 4.0 x16:</strong> ~64 GB/s (mainstream since 2020)
        </li>
        <li>
          <strong>PCIe 5.0 x16:</strong> ~128 GB/s (latest-gen boards)
        </li>
      </ul>

      <h3>When This Matters</h3>
      <p>
        For GPUs, PCIe 3.0 x16 is still sufficient for most cards up to the{" "}
        <A name="RTX 4070 Super" />. But high-end GPUs like the{" "}
        <A name="RTX 4090" /> can lose 3-5% performance on PCIe 3.0 versus 4.0
        in bandwidth-heavy titles. The bigger issue is{" "}
        <strong>NVMe SSDs</strong>: a PCIe 4.0 NVMe drive like the{" "}
        <A name="Samsung 990 Pro 2TB" /> tops out at 7,450 MB/s, but plugging
        it into a PCIe 3.0 M.2 slot cuts that to ~3,500 MB/s — less than half
        the drive&apos;s rated speed.
      </p>

      <h3>How to Check</h3>
      <p>
        Open <strong>GPU-Z</strong> and look at the &quot;Bus Interface&quot;
        field. It shows both the slot&apos;s capability and the current link
        speed (e.g., &quot;PCIe 4.0 x16 @ x16 4.0&quot;). If the second number
        is lower than the first, your board is limiting the connection. For
        NVMe drives, use <strong>CrystalDiskMark</strong> — if sequential
        reads are capped around 3,500 MB/s on a drive rated for 7,000+, the M.2
        slot is PCIe 3.0.
      </p>

      <h3>The Fix</h3>
      <p>
        If your board only has PCIe 3.0 slots, upgrading the motherboard is
        the only solution. Any modern AM5 or LGA 1700/1851 board supports PCIe
        4.0 at minimum. For NVMe, make sure the specific M.2 slot you&apos;re
        using is wired for PCIe 4.0 or 5.0 — many boards have a mix, and the
        second M.2 slot is often PCIe 3.0 even on newer boards. Check your
        motherboard manual.
      </p>

      <h2>2. VRM Throttling (Power Delivery Limits)</h2>
      <p>
        Your motherboard&apos;s <strong>VRMs (Voltage Regulator Modules)</strong>{" "}
        convert your PSU&apos;s 12V rail into the precise voltage your CPU needs.
        Cheap motherboards ship with weak VRMs — 4+2 or 6+2 phase designs that
        overheat under sustained load, causing the CPU to{" "}
        <strong>throttle even when temperatures are fine</strong>.
      </p>

      <h3>Symptoms</h3>
      <ul>
        <li>
          CPU boost clocks drop after 5-10 minutes of sustained load (rendering,
          compiling, stress tests)
        </li>
        <li>
          HWiNFO shows VRM temperatures above 100°C under load
        </li>
        <li>
          CPU performs worse in long benchmarks than in short bursts
        </li>
        <li>
          You paired a high-TDP CPU (125W+) with a budget B-series motherboard
        </li>
      </ul>

      <h3>Who&apos;s at Risk</h3>
      <p>
        This primarily affects users running power-hungry CPUs like the{" "}
        <A name="Intel Core i9-14900K" /> (253W PBP) or{" "}
        <A name="AMD Ryzen 9 9950X" /> (170W TDP) on budget boards. A $120 B660
        motherboard physically can&apos;t deliver stable power to a 250W+ CPU
        under full load. The VRMs overheat, the board cuts power, and your
        expensive CPU runs at base clock instead of boost.
      </p>

      <h3>The Fix</h3>
      <ul>
        <li>
          <strong>Check VRM temps:</strong> Use HWiNFO64 to monitor VRM
          temperatures under load. Anything above 100°C is a problem.
        </li>
        <li>
          <strong>Add VRM cooling:</strong> Stick-on heatsinks or a small fan
          pointed at the VRM area can drop temps 10-20°C on boards with exposed
          VRMs.
        </li>
        <li>
          <strong>Limit CPU power draw:</strong> In BIOS, reduce PL2 (Power
          Limit 2) to a level your board can sustain. You&apos;ll lose some peak
          performance but gain stability.
        </li>
        <li>
          <strong>Upgrade the board:</strong> For high-TDP CPUs, invest in a
          board with beefy VRMs. The{" "}
          <A name="MSI MAG B760 Tomahawk WiFi" /> ($180) or{" "}
          <A name="ASUS TUF Gaming B650-Plus WiFi" /> ($200) handle up to 170W
          CPUs with ease. For 200W+ CPUs, look at X670E or Z790 boards with
          16+ phase VRMs.
        </li>
      </ul>

      <h2>3. RAM Speed and XMP Limitations</h2>
      <p>
        Not all motherboards support the same RAM speeds. A board that caps at
        DDR4-3200 will run your DDR4-3600 kit at the lower speed — and you
        won&apos;t know unless you check BIOS. This matters because{" "}
        <strong>
          RAM speed directly affects CPU-bound performance, especially on AMD
          Ryzen
        </strong>{" "}
        where the Infinity Fabric clock is tied to memory speed.
      </p>

      <h3>Common Limitations</h3>
      <ul>
        <li>
          <strong>Budget B-series boards</strong> may have lower maximum
          supported RAM speeds or fewer XMP/EXPO profiles validated
        </li>
        <li>
          <strong>Two DIMM slots vs four:</strong> Boards with only two DIMM
          slots actually overclock RAM better (shorter signal traces), but you
          lose upgrade capacity
        </li>
        <li>
          <strong>DDR4 vs DDR5:</strong> Some AM5 and LGA 1700 boards only
          support one generation — make sure your board matches your RAM type
        </li>
        <li>
          <strong>Topology matters:</strong> Populating all four DIMM slots
          reduces maximum stable RAM speed, sometimes significantly
        </li>
      </ul>

      <h3>How to Check</h3>
      <p>
        Open <strong>CPU-Z</strong>, go to the Memory tab, and check the
        &quot;DRAM Frequency&quot; field. Double that number (DDR = Double Data
        Rate) to get your effective speed. If it&apos;s lower than your
        RAM&apos;s rated speed, XMP/EXPO may not be enabled or the board
        doesn&apos;t support your kit&apos;s full speed.
      </p>

      <h3>The Fix</h3>
      <ul>
        <li>
          <strong>Enable XMP/EXPO in BIOS</strong> — The single most overlooked
          free performance boost. Our{" "}
          <Link href="/dashboard" className="text-cyan underline">
            PC Bottleneck Analyzer
          </Link>{" "}
          checks this and provides motherboard-specific instructions.
        </li>
        <li>
          <strong>Check QVL (Qualified Vendor List):</strong> Your motherboard
          manufacturer publishes a list of validated RAM kits. Kits on the QVL
          are much more likely to hit rated speeds.
        </li>
        <li>
          <strong>Try two DIMMs instead of four:</strong> If you&apos;re
          running four sticks and XMP is unstable, try two sticks in the
          optimal slots (usually A2 and B2). Dual-rank, dual-channel with two
          sticks is often faster than four sticks at a lower speed.
        </li>
      </ul>

      <h2>4. Limited M.2 Slots and SATA Port Sharing</h2>
      <p>
        Budget motherboards often have <strong>shared bandwidth</strong> between
        M.2 slots and SATA ports. Installing a second NVMe drive might disable
        two SATA ports — meaning your existing hard drives or SATA SSDs
        vanish from the system. Even worse, some boards run their second M.2
        slot through the chipset instead of directly from the CPU, adding
        latency and reducing bandwidth.
      </p>

      <h3>How This Bottlenecks You</h3>
      <ul>
        <li>
          <strong>Fewer storage options:</strong> You can&apos;t use all
          the drives you want simultaneously
        </li>
        <li>
          <strong>Chipset bottleneck:</strong> NVMe drives routed through the
          chipset share bandwidth with USB ports, audio, networking, and other
          peripherals — all competing for a limited PCIe uplink to the CPU
        </li>
        <li>
          <strong>Surprise disconnections:</strong> SATA devices disappearing
          after adding an M.2 drive catches many builders off guard
        </li>
      </ul>

      <h3>The Fix</h3>
      <p>
        Before buying storage, read your motherboard manual&apos;s
        &quot;storage configuration&quot; section. It maps out which M.2 slots
        disable which SATA ports. For heavy storage needs (NAS duties, game
        library, video editing scratch disks), choose a board with{" "}
        <strong>three or more M.2 slots</strong> that connect directly to the
        CPU. The <A name="ASUS ROG Strix B650E-F Gaming WiFi" /> ($260) and{" "}
        <A name="MSI MAG X670E Tomahawk WiFi" /> ($290) both offer three
        direct-to-CPU M.2 slots with no SATA sharing.
      </p>

      <h2>5. Missing or Outdated I/O Features</h2>
      <p>
        An older motherboard might lack features that modern components and
        peripherals require, creating bottlenecks you wouldn&apos;t think to
        look for:
      </p>

      <h3>USB Bandwidth</h3>
      <p>
        USB 3.0 (5 Gbps) ports can&apos;t keep up with modern external SSDs
        that support USB 3.2 Gen 2 (10 Gbps) or USB4 (40 Gbps). If you&apos;re
        transferring large video files or game backups to an external NVMe
        enclosure, your board&apos;s USB generation is the bottleneck — not
        the drive.
      </p>

      <h3>WiFi and Networking</h3>
      <p>
        Boards with WiFi 5 or no WiFi at all limit your wireless speeds. WiFi 6E
        and WiFi 7 boards support significantly higher throughput and lower
        latency — critical for online gaming and large file transfers. On the
        wired side, 2.5 Gbps Ethernet is now standard on mid-range boards and
        makes a real difference for NAS access and local file sharing.
      </p>

      <h3>Front Panel Connectivity</h3>
      <p>
        If your board lacks a USB-C header, your case&apos;s front-panel USB-C
        port sits unused. Boards without Thunderbolt support can&apos;t drive
        Thunderbolt docks, eGPUs, or high-speed storage arrays.
      </p>

      <h3>The Fix</h3>
      <p>
        Evaluate whether your board&apos;s I/O matches your actual usage. If
        you&apos;re constantly waiting on transfers, fighting WiFi drops, or
        staring at unused ports, a board upgrade may deliver more
        quality-of-life improvement than a CPU or GPU bump. Modern mid-range
        boards like the <A name="MSI MAG B760 Tomahawk WiFi" /> include USB
        3.2 Gen 2, WiFi 6E, and 2.5G Ethernet as standard.
      </p>

      <h2>6. BIOS Limitations and Missing Features</h2>
      <p>
        Sometimes the bottleneck isn&apos;t hardware — it&apos;s firmware. An
        outdated or stripped-down BIOS can hold back your system in ways you
        can&apos;t see:
      </p>
      <ul>
        <li>
          <strong>No Resizable BAR / Smart Access Memory:</strong> This
          feature gives the CPU direct access to the full GPU memory, boosting
          FPS 5-10% in supported games. Many older boards need a BIOS update
          to enable it, and some never got the update.
        </li>
        <li>
          <strong>Limited CPU support:</strong> Budget boards may not support
          newer CPU steppings without a BIOS update — and some don&apos;t
          support the latest chips at all, even on the same socket.
        </li>
        <li>
          <strong>Missing overclocking options:</strong> H-series (Intel) and
          A-series (AMD) boards lock out CPU and memory overclocking. You
          can&apos;t even enable XMP on some locked Intel boards.
        </li>
        <li>
          <strong>No Precision Boost Overdrive (PBO):</strong> On AMD, PBO
          lets the CPU automatically boost higher and longer based on thermal
          and power headroom. Budget A-series boards may disable or limit this
          feature.
        </li>
      </ul>

      <h3>The Fix</h3>
      <ul>
        <li>
          <strong>Update your BIOS:</strong> Visit your motherboard
          manufacturer&apos;s support page and install the latest BIOS. This
          alone can unlock Resizable BAR, improve RAM compatibility, and add
          support for newer CPUs.
        </li>
        <li>
          <strong>Check feature support before buying:</strong> When planning a
          build, verify the board supports the features you need — XMP/EXPO,
          Resizable BAR, PBO, and any planned CPU upgrades.
        </li>
      </ul>

      <h2>How to Tell If Your Motherboard Is the Bottleneck</h2>
      <p>
        Unlike CPU or GPU bottlenecks, motherboard bottlenecks don&apos;t show
        up in a single utilization number. Look for these patterns instead:
      </p>
      <ol>
        <li>
          <strong>Run our{" "}
          <Link href="/dashboard" className="text-cyan underline">
            free PC Bottleneck Analyzer
          </Link></strong>{" "}
          — it checks your PCIe generation, RAM speed vs rated speed, and
          storage interface to flag motherboard-level issues automatically.
        </li>
        <li>
          <strong>Check GPU-Z bus interface:</strong> If your GPU reports a
          lower PCIe link than it supports, the board is the constraint.
        </li>
        <li>
          <strong>Run CrystalDiskMark on NVMe drives:</strong> If sequential
          speeds are 50%+ below the drive&apos;s spec, the M.2 slot is the
          limit.
        </li>
        <li>
          <strong>Monitor VRM temps with HWiNFO64:</strong> If VRM
          temperatures exceed 100°C under load, the power delivery is choking
          your CPU.
        </li>
        <li>
          <strong>Compare CPU-Z RAM speed to kit rating:</strong> If
          effective speed is below rated speed, the board or its settings are
          holding back your memory.
        </li>
        <li>
          <strong>Check for disabled SATA ports:</strong> If drives
          disappeared after installing an M.2, you&apos;re hitting a lane
          sharing limit.
        </li>
      </ol>

      <h2>Best Motherboard Upgrades by Platform (2026)</h2>
      <p>
        If your board is the bottleneck, here are the best replacements at each
        price tier:
      </p>

      <h3>AMD AM5 (Ryzen 7000 / 9000 Series)</h3>
      <ul>
        <li>
          <strong>Budget:</strong>{" "}
          <A name="Gigabyte B650 Gaming X AX V2" /> (~$160) — PCIe 4.0, DDR5,
          solid VRMs for CPUs up to 105W, WiFi 6E.
        </li>
        <li>
          <strong>Mid-range:</strong>{" "}
          <A name="ASUS TUF Gaming B650-Plus WiFi" /> (~$200) — beefy VRMs,
          three M.2 slots, USB-C header, handles up to Ryzen 9 CPUs.
        </li>
        <li>
          <strong>High-end:</strong>{" "}
          <A name="MSI MAG X670E Tomahawk WiFi" /> (~$290) — PCIe 5.0 GPU
          slot, three direct-to-CPU M.2 slots, top-tier VRMs, WiFi 6E,
          2.5G LAN.
        </li>
      </ul>

      <h3>Intel LGA 1700 (12th/13th/14th Gen)</h3>
      <ul>
        <li>
          <strong>Budget:</strong>{" "}
          <A name="MSI PRO B760-P WiFi DDR5" /> (~$140) — DDR5 support, PCIe
          4.0, WiFi 6E, adequate VRMs for i5/i7 CPUs.
        </li>
        <li>
          <strong>Mid-range:</strong>{" "}
          <A name="MSI MAG B760 Tomahawk WiFi" /> (~$180) — Excellent VRMs for
          up to i9 CPUs, three M.2 slots, USB 3.2 Gen 2, WiFi 6E.
        </li>
        <li>
          <strong>High-end:</strong>{" "}
          <A name="ASUS ROG Strix Z790-A Gaming WiFi" /> (~$350) — PCIe 5.0
          for GPU and M.2, DDR5, Thunderbolt 4, top-tier overclocking VRMs.
        </li>
      </ul>

      <h3>Intel LGA 1851 (Arrow Lake / 200 Series)</h3>
      <ul>
        <li>
          <strong>Budget:</strong>{" "}
          <A name="ASUS Prime B860-Plus WiFi" /> (~$180) — DDR5, PCIe 5.0 M.2,
          WiFi 7, solid entry point for the latest Intel platform.
        </li>
        <li>
          <strong>Mid-range:</strong>{" "}
          <A name="MSI MAG Z890 Tomahawk WiFi" /> (~$280) — Full PCIe 5.0
          support, beefy VRMs, four M.2 slots, WiFi 7, Thunderbolt 4.
        </li>
      </ul>

      <h2>When a Motherboard Upgrade Is (and Isn&apos;t) Worth It</h2>

      <h3>Worth it if:</h3>
      <ul>
        <li>
          Your VRMs are throttling a high-TDP CPU you already own
        </li>
        <li>
          You&apos;re stuck on PCIe 3.0 and want full NVMe 4.0 SSD
          performance
        </li>
        <li>
          You need more M.2 slots, USB-C, or WiFi 6E/7 and adapters
          aren&apos;t cutting it
        </li>
        <li>
          You&apos;re planning a CPU upgrade that requires a new socket anyway
        </li>
        <li>
          Your BIOS doesn&apos;t support Resizable BAR, XMP, or newer CPUs
        </li>
      </ul>

      <h3>Not worth it if:</h3>
      <ul>
        <li>
          Your CPU or GPU is the clear bottleneck — fix the weaker component
          first
        </li>
        <li>
          You&apos;re gaming at 4K 60 Hz — PCIe 3.0 barely affects GPU
          performance at this target
        </li>
        <li>
          Your board&apos;s only issue is cosmetic (no RGB headers, old BIOS
          UI)
        </li>
        <li>
          You&apos;re happy with current performance and just read this article
          — don&apos;t upgrade for the sake of specs
        </li>
      </ul>

      <h2>Stop Guessing — Scan Your System</h2>
      <p>
        Motherboard bottlenecks are the hardest to spot because they hide
        behind other components. The fastest way to find out if your board is
        holding you back is to run our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          free PC Bottleneck Analyzer
        </Link>
        . It scans your entire system — PCIe lanes, RAM configuration, storage
        interfaces, and VRM behavior — and flags exactly where the limits are,
        with specific upgrade recommendations tailored to your hardware.
      </p>
      <p>
        No signup required. Run the scanner and get your results in 60 seconds.
      </p>
    </>
  );
}
