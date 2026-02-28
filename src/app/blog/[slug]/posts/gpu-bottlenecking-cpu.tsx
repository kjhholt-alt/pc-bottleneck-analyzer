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

export function GpuBottleneckingCpu() {
  return (
    <>
      <p>
        You just dropped $500 on a new graphics card, but your frame rate barely
        moved. Sound familiar? The culprit is almost always a{" "}
        <strong>bottleneck</strong> &mdash; one component holding the rest of
        your system back. Understanding whether your GPU is bottlenecking your
        CPU (or vice versa) is the first step toward getting the performance you
        paid for.
      </p>

      <h2>What Is a Bottleneck, Exactly?</h2>
      <p>
        A bottleneck happens when one component can&apos;t keep up with the
        others. Think of it like a highway: if four lanes merge into one, traffic
        backs up regardless of how fast the cars can go. In a PC, your CPU and
        GPU work together to render every frame. If one finishes its work much
        faster than the other, it sits idle waiting &mdash; and your frame rate
        is limited by the slower component.
      </p>
      <p>
        The key insight: <strong>every system has a bottleneck somewhere</strong>
        . The goal isn&apos;t to eliminate bottlenecks entirely &mdash;
        it&apos;s to make sure no single component is dramatically holding the
        others back.
      </p>

      <h2>Signs Your CPU Is Bottlenecking Your GPU</h2>
      <p>
        This is the most common scenario in gaming PCs built on a budget. You
        bought a powerful GPU but paired it with an older or entry-level CPU.
        Here&apos;s what to look for:
      </p>
      <ul>
        <li>
          <strong>GPU usage stays below 80&ndash;90%</strong> during gaming, even
          at high settings. Your GPU has headroom it can&apos;t use because
          it&apos;s waiting on the CPU.
        </li>
        <li>
          <strong>CPU usage is pinned at 90&ndash;100%</strong> across most
          cores. Open Task Manager (Ctrl+Shift+Esc) and check per-core usage
          while gaming.
        </li>
        <li>
          <strong>FPS doesn&apos;t change when you raise or lower resolution</strong>.
          Resolution primarily affects GPU load. If dropping from 1440p to 1080p
          doesn&apos;t increase FPS, the CPU is the limit.
        </li>
        <li>
          <strong>Stuttering in CPU-heavy games</strong>. Open-world titles like
          Cyberpunk 2077, Cities: Skylines, and Starfield are CPU-intensive. If
          these stutter but simpler games run fine, the CPU is your bottleneck.
        </li>
        <li>
          <strong>Low 1% lows</strong>. Your average FPS might be acceptable, but
          the 1% low frames (the worst drops) are much worse &mdash; causing
          visible hitching.
        </li>
      </ul>

      <h2>Signs Your GPU Is Bottlenecking Your CPU</h2>
      <p>
        This happens when you have a strong CPU paired with an older or
        underpowered GPU. It&apos;s common in systems that were originally built
        for productivity and later used for gaming.
      </p>
      <ul>
        <li>
          <strong>GPU usage is at 95&ndash;100%</strong> while CPU usage is well
          below 50%. Your GPU is maxed out but your CPU is barely working.
        </li>
        <li>
          <strong>Lowering resolution or graphics quality dramatically increases FPS</strong>.
          This confirms the GPU is the limit &mdash; reducing its workload frees
          up performance.
        </li>
        <li>
          <strong>FPS scales linearly with GPU tier</strong>. If you benchmark
          with a tool like 3DMark and your GPU score is far below your CPU score,
          the GPU is the weak link.
        </li>
        <li>
          <strong>Modern games barely hit 30 FPS at medium settings</strong>,
          even though your CPU handles multitasking without breaking a sweat.
        </li>
      </ul>

      <h2>How to Diagnose Your Bottleneck</h2>
      <p>
        The fastest way to find your exact bottleneck is to use a dedicated
        analysis tool. Here are your options:
      </p>
      <ol>
        <li>
          <strong>
            <Link href="/dashboard" className="text-cyan underline">
              PC Bottleneck Analyzer
            </Link>
          </strong>{" "}
          (free) &mdash; Our tool scans your entire system, scores each
          component, and pinpoints exactly which part is holding you back. It
          even suggests specific upgrades with price estimates.
        </li>
        <li>
          <strong>Task Manager</strong> &mdash; The quickest manual check. Open
          it during a gaming session and watch CPU vs. GPU usage. If one is maxed
          and the other isn&apos;t, you&apos;ve found your bottleneck.
        </li>
        <li>
          <strong>HWiNFO64</strong> &mdash; For detailed monitoring including
          temperatures, clock speeds, and throttling detection. Free and widely
          trusted.
        </li>
        <li>
          <strong>MSI Afterburner + RivaTuner</strong> &mdash; Overlay that shows
          CPU/GPU usage, temps, and FPS in real-time while you play. Great for
          spotting momentary bottlenecks.
        </li>
      </ol>

      <h2>Common Bottleneck Pairings</h2>
      <p>
        Based on analysis of thousands of systems, here are the most common
        mismatched pairings we see:
      </p>

      <table>
        <thead>
          <tr>
            <th>GPU</th>
            <th>CPU</th>
            <th>Bottleneck</th>
            <th>Fix</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>RTX 4070 Ti Super</td>
            <td>Intel i5-10400</td>
            <td>Severe CPU bottleneck</td>
            <td>
              Upgrade to <A name="Intel Core i5-14600K" /> or{" "}
              <A name="AMD Ryzen 7 7800X3D" />
            </td>
          </tr>
          <tr>
            <td>RX 7800 XT</td>
            <td>Ryzen 5 3600</td>
            <td>Moderate CPU bottleneck</td>
            <td>
              Upgrade to <A name="AMD Ryzen 5 7600X" /> (same AM4/AM5 board may
              work)
            </td>
          </tr>
          <tr>
            <td>GTX 1650</td>
            <td>Ryzen 7 5800X</td>
            <td>Severe GPU bottleneck</td>
            <td>
              Upgrade to <A name="RTX 4060" /> or <A name="RX 7600" />
            </td>
          </tr>
          <tr>
            <td>RTX 3060</td>
            <td>Intel i7-12700K</td>
            <td>Moderate GPU bottleneck</td>
            <td>
              Upgrade to <A name="RTX 4070 Super" /> for balanced 1440p gaming
            </td>
          </tr>
          <tr>
            <td>RTX 4090</td>
            <td>Intel i5-12400F</td>
            <td>Severe CPU bottleneck</td>
            <td>
              Upgrade to <A name="Intel Core i7-14700K" /> or{" "}
              <A name="AMD Ryzen 9 9900X" />
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Free Fixes Before You Spend Money</h2>
      <p>
        Before reaching for your wallet, try these zero-cost optimizations.
        They&apos;re surprisingly effective and often fix mild bottlenecks
        entirely:
      </p>
      <ul>
        <li>
          <strong>Enable XMP/EXPO in BIOS</strong> &mdash; Your RAM is probably
          running at default JEDEC speeds (2133&ndash;2400 MHz) instead of its
          rated speed. Enabling XMP can give you 10&ndash;25% more FPS in
          CPU-bound scenarios. Our{" "}
          <Link href="/dashboard" className="text-cyan underline">
            tool includes per-motherboard BIOS guides
          </Link>{" "}
          to walk you through it.
        </li>
        <li>
          <strong>Enable Resizable BAR / Smart Access Memory</strong> &mdash;
          Free 5&ndash;10% GPU performance in supported games. Enable in BIOS
          under PCI settings.
        </li>
        <li>
          <strong>Update GPU drivers</strong> &mdash; NVIDIA and AMD regularly
          release game-specific optimizations. A single driver update can add
          10&ndash;15% performance in newly released titles.
        </li>
        <li>
          <strong>Set Windows power plan to High Performance</strong> &mdash;
          Prevents your CPU from throttling down during gaming. Control Panel
          &rarr; Power Options &rarr; High Performance.
        </li>
        <li>
          <strong>Close background apps</strong> &mdash; Chrome with 30 tabs,
          Discord overlay, and hardware monitors all compete for CPU time. Close
          what you don&apos;t need.
        </li>
        <li>
          <strong>Disable Game Bar and Game DVR</strong> &mdash; Windows
          Game Bar records clips in the background, eating GPU and CPU
          resources. Settings &rarr; Gaming &rarr; Game Bar &rarr; Off.
        </li>
      </ul>

      <h2>When to Upgrade (And What to Buy)</h2>
      <p>
        If free fixes aren&apos;t enough, the rule is simple:{" "}
        <strong>upgrade the component that&apos;s maxed out</strong>.
      </p>
      <ul>
        <li>
          <strong>CPU bottleneck?</strong> The best value gaming CPUs in 2026 are
          the <A name="AMD Ryzen 7 9800X3D" /> ($449, the gaming king) and the{" "}
          <A name="Intel Core i5-14600K" /> ($280, unbeatable value). Both will
          eliminate CPU bottlenecks for any current GPU.
        </li>
        <li>
          <strong>GPU bottleneck?</strong> The sweet spot in 2026 is the{" "}
          <A name="RTX 4070 Super" /> ($550) for 1440p or the{" "}
          <A name="RX 7800 XT" /> ($450) for value-oriented 1440p gaming.
        </li>
      </ul>

      <h2>Stop Guessing, Start Measuring</h2>
      <p>
        The difference between a well-balanced PC and a bottlenecked one can be
        30&ndash;50% of your potential FPS. Don&apos;t guess which component to
        upgrade &mdash; measure it.
      </p>
      <p>
        Our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          free PC Bottleneck Analyzer
        </Link>{" "}
        scans your system in 60 seconds and tells you exactly what&apos;s holding
        you back, with specific upgrade recommendations and estimated performance
        gains. No signup required.
      </p>
    </>
  );
}
