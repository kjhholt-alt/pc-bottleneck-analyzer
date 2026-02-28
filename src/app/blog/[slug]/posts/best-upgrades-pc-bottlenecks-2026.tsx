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

export function BestUpgrades2026() {
  return (
    <>
      <p>
        Your PC feels slower than it should. Games stutter, load times drag, and
        you&apos;re not hitting the frame rates you expected. The problem is
        almost always a bottleneck &mdash; one component that can&apos;t keep up
        with the rest. But which part should you upgrade? And how much should you
        spend?
      </p>
      <p>
        This guide breaks down the best upgrades for every type of PC bottleneck
        in 2026, organized by budget. Every recommendation comes from real
        benchmark data and price-to-performance analysis across 165+ components
        in our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          hardware database
        </Link>
        .
      </p>

      <h2>Before You Buy: Diagnose First</h2>
      <p>
        The single biggest mistake PC builders make is upgrading the wrong
        component. A new $500 GPU won&apos;t help if your CPU is the bottleneck.
        More RAM won&apos;t matter if your storage is the slow link.
      </p>
      <p>
        Run our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          free PC Bottleneck Analyzer
        </Link>{" "}
        first. It takes 60 seconds and tells you exactly which component is
        holding you back, with a 0&ndash;100 performance score and specific
        upgrade recommendations.
      </p>

      <h2>Best CPU Upgrades</h2>
      <p>
        Your CPU matters most in competitive multiplayer games (Valorant, CS2,
        Fortnite), open-world titles (Starfield, Cyberpunk), and any game with
        lots of AI or physics. If Task Manager shows your CPU above 85% while
        your GPU sits below 70%, a CPU upgrade will have the biggest impact.
      </p>

      <h3>Budget: Under $200</h3>
      <ul>
        <li>
          <strong>
            <A name="AMD Ryzen 5 7600" />
          </strong>{" "}
          (~$180) &mdash; 6 cores, 12 threads, AM5 socket. The best entry point
          into current-gen AMD. Handles any GPU up to an RTX 4070 without
          bottlenecking. Gaming score: 88/100.
        </li>
        <li>
          <strong>
            <A name="Intel Core i5-12400F" />
          </strong>{" "}
          (~$140) &mdash; Still excellent value on the LGA 1700 platform. Pairs
          well with mid-range GPUs. Gaming score: 82/100.
        </li>
      </ul>

      <h3>Mid-Range: $200&ndash;400</h3>
      <ul>
        <li>
          <strong>
            <A name="Intel Core i5-14600K" />
          </strong>{" "}
          (~$280) &mdash; 14 cores (6P+8E), unlocked. Excellent all-rounder that
          won&apos;t bottleneck any GPU below the RTX 4080. Gaming score:
          92/100.
        </li>
        <li>
          <strong>
            <A name="AMD Ryzen 7 7700X" />
          </strong>{" "}
          (~$280) &mdash; 8 cores, 16 threads. Great for gaming and streaming
          simultaneously. Gaming score: 91/100.
        </li>
      </ul>

      <h3>High-End: $400+</h3>
      <ul>
        <li>
          <strong>
            <A name="AMD Ryzen 7 9800X3D" />
          </strong>{" "}
          (~$449) &mdash; The undisputed gaming champion. 3D V-Cache gives it
          10&ndash;20% more gaming FPS than anything else. Will not bottleneck
          even an RTX 4090 or RTX 5090. Gaming score: 98/100.
        </li>
        <li>
          <strong>
            <A name="Intel Core i7-14700K" />
          </strong>{" "}
          (~$380) &mdash; 20 cores, tremendous multi-threaded performance. Great
          if you also do video editing or 3D rendering. Gaming score: 95/100.
        </li>
      </ul>

      <h2>Best GPU Upgrades</h2>
      <p>
        The GPU is the single most important component for gaming performance. If
        your GPU usage is pinned at 95&ndash;100% while your CPU sits below 60%,
        a GPU upgrade will give you the biggest FPS jump.
      </p>

      <h3>Budget: Under $300</h3>
      <ul>
        <li>
          <strong>
            <A name="RX 7600" />
          </strong>{" "}
          (~$250) &mdash; The best value GPU in 2026. Handles 1080p high settings
          at 60+ FPS in every current game. 8GB VRAM is tight for some 4K
          textures but perfect at 1080p. Gaming score: 62/100.
        </li>
        <li>
          <strong>
            <A name="RTX 4060" />
          </strong>{" "}
          (~$280) &mdash; DLSS 3 frame generation is a game-changer for this
          tier. Effectively doubles your FPS in supported titles. Gaming score:
          65/100.
        </li>
      </ul>

      <h3>Mid-Range: $300&ndash;550</h3>
      <ul>
        <li>
          <strong>
            <A name="RX 7800 XT" />
          </strong>{" "}
          (~$450) &mdash; The 1440p sweet spot. 16GB VRAM means it&apos;s
          future-proof for years. Excellent rasterization performance. Gaming
          score: 78/100.
        </li>
        <li>
          <strong>
            <A name="RTX 4070 Super" />
          </strong>{" "}
          (~$550) &mdash; DLSS 3 + ray tracing leader in this price range. If
          you care about ray tracing, this is the one. Gaming score: 82/100.
        </li>
      </ul>

      <h3>High-End: $550+</h3>
      <ul>
        <li>
          <strong>
            <A name="RTX 4070 Ti Super" />
          </strong>{" "}
          (~$750) &mdash; The 1440p ultra / 4K high card. 16GB VRAM, outstanding
          DLSS 3 support, strong ray tracing. Gaming score: 87/100.
        </li>
        <li>
          <strong>
            <A name="RTX 4080 Super" />
          </strong>{" "}
          (~$950) &mdash; If you want no compromises at 1440p and strong 4K
          performance. Gaming score: 92/100.
        </li>
      </ul>

      <h2>RAM: The Most Overlooked Bottleneck</h2>
      <p>
        RAM bottlenecks are sneaky. They don&apos;t show up as high usage in Task
        Manager &mdash; they show up as{" "}
        <strong>stuttering, slow load times, and inconsistent frame rates</strong>
        . Here&apos;s what to check:
      </p>
      <ul>
        <li>
          <strong>Capacity</strong> &mdash; 16GB is the minimum for gaming in
          2026. If you have 8GB, you&apos;re running out of memory in most
          modern titles, forcing Windows to use your SSD as virtual memory
          (dramatically slower). Upgrade to{" "}
          <A name="32GB DDR5 RAM kit" /> if your board supports DDR5, or{" "}
          <A name="32GB DDR4 RAM kit" /> for older platforms.
        </li>
        <li>
          <strong>Speed (XMP/EXPO)</strong> &mdash; Your RAM has a rated speed
          printed on the box (e.g., DDR5-6000). But it probably runs at the
          default JEDEC speed (DDR5-4800 or DDR4-2133) unless you enabled
          XMP/EXPO in BIOS. This is the single most impactful free fix &mdash;
          it can add 10&ndash;25% FPS in CPU-bound games. Our tool detects this
          automatically.
        </li>
        <li>
          <strong>Dual channel</strong> &mdash; Running a single RAM stick
          halves your memory bandwidth. Always use two identical sticks in the
          correct slots (usually slots 2 and 4). Check your motherboard manual.
        </li>
      </ul>

      <h2>Storage: NVMe vs. SATA SSD</h2>
      <p>
        Storage doesn&apos;t affect FPS, but it dramatically impacts load times,
        texture streaming, and system responsiveness. If you&apos;re still
        running a hard drive (HDD) as your boot drive, this is the single best
        quality-of-life upgrade you can make.
      </p>
      <ul>
        <li>
          <strong>If you have an HDD</strong> &mdash; Any SSD is a massive
          upgrade. A <A name="1TB NVMe SSD" /> (~$60&ndash;80) will make your
          entire system feel like a new computer.
        </li>
        <li>
          <strong>If you have a SATA SSD</strong> &mdash; Upgrading to NVMe
          won&apos;t change your FPS, but game load times drop from 30 seconds
          to 5 seconds. Worth it if your motherboard has an M.2 slot.
        </li>
        <li>
          <strong>DirectStorage</strong> &mdash; Games built for DirectStorage
          (like Ratchet & Clank, Black Myth Wukong) load assets directly from
          NVMe to GPU, bypassing the CPU entirely. This technology is still
          early, but it&apos;s the future.
        </li>
      </ul>

      <h2>Free Optimizations Before Spending Money</h2>
      <p>
        These cost nothing and often fix mild bottlenecks entirely. Try all of
        them before buying hardware:
      </p>
      <ol>
        <li>
          <strong>Enable XMP/EXPO</strong> &mdash; BIOS setting, 10&ndash;25%
          FPS gain in CPU-bound games. The #1 free fix.
        </li>
        <li>
          <strong>Update GPU drivers</strong> &mdash; NVIDIA and AMD optimize
          for new games regularly. A single update can add 10&ndash;15% in
          specific titles.
        </li>
        <li>
          <strong>Enable Resizable BAR</strong> &mdash; BIOS setting, 5&ndash;10%
          GPU performance in supported games. Free.
        </li>
        <li>
          <strong>Windows High Performance power plan</strong> &mdash; Prevents
          CPU throttling during gaming.
        </li>
        <li>
          <strong>Disable Game Bar + Game DVR</strong> &mdash; Stops Windows from
          recording gameplay in the background.
        </li>
        <li>
          <strong>Clean out startup programs</strong> &mdash; Task Manager &rarr;
          Startup &rarr; disable everything you don&apos;t need running at boot.
        </li>
      </ol>

      <h2>Upgrade Comparison Table</h2>
      <p>
        Here&apos;s a quick comparison of the best upgrades at each price point:
      </p>

      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Budget Pick</th>
            <th>Price</th>
            <th>Score</th>
            <th>Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CPU</td>
            <td>
              <A name="AMD Ryzen 5 7600" />
            </td>
            <td>~$180</td>
            <td>88</td>
            <td>1080p gaming, light multitasking</td>
          </tr>
          <tr>
            <td>CPU</td>
            <td>
              <A name="AMD Ryzen 7 9800X3D" />
            </td>
            <td>~$449</td>
            <td>98</td>
            <td>Maximum gaming FPS, no compromises</td>
          </tr>
          <tr>
            <td>GPU</td>
            <td>
              <A name="RX 7600" />
            </td>
            <td>~$250</td>
            <td>62</td>
            <td>1080p 60+ FPS, best value</td>
          </tr>
          <tr>
            <td>GPU</td>
            <td>
              <A name="RTX 4070 Super" />
            </td>
            <td>~$550</td>
            <td>82</td>
            <td>1440p gaming, ray tracing, DLSS 3</td>
          </tr>
          <tr>
            <td>RAM</td>
            <td>
              <A name="32GB DDR5-6000 kit" />
            </td>
            <td>~$90</td>
            <td>&mdash;</td>
            <td>Modern gaming, future-proof capacity</td>
          </tr>
          <tr>
            <td>Storage</td>
            <td>
              <A name="1TB NVMe SSD" />
            </td>
            <td>~$70</td>
            <td>&mdash;</td>
            <td>Boot drive, game load times</td>
          </tr>
        </tbody>
      </table>

      <h2>How to Know Exactly What to Upgrade</h2>
      <p>
        Don&apos;t guess. Every dollar you spend on the wrong upgrade is a
        dollar wasted. Here&apos;s the process:
      </p>
      <ol>
        <li>
          <Link href="/dashboard" className="text-cyan underline">
            <strong>Scan your PC</strong>
          </Link>{" "}
          with our free tool (60 seconds, no signup).
        </li>
        <li>
          Check your <strong>component scores</strong> &mdash; the lowest score
          is your bottleneck.
        </li>
        <li>
          Use the <strong>Upgrade Simulator</strong> tab to see exactly how much
          a new CPU or GPU would improve your score.
        </li>
        <li>
          Check the <strong>Game FPS Estimator</strong> to see predicted frame
          rates in your favorite games before and after the upgrade.
        </li>
        <li>
          Click the upgrade recommendation links to see current prices on Amazon.
        </li>
      </ol>

      <p>
        Thousands of gamers have used our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          PC Bottleneck Analyzer
        </Link>{" "}
        to find and fix their bottlenecks. It&apos;s free during beta &mdash; no
        account, no paywall, no catches. Just actionable data about your
        hardware.
      </p>
    </>
  );
}
