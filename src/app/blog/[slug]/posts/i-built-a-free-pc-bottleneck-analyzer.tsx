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

export function IBuiltAFreeBottleneckAnalyzer() {
  return (
    <>
      <p>
        Three months ago I started building a tool that would tell you exactly
        what&apos;s holding your PC back &mdash; no guesswork, no vague
        &ldquo;your system is fine&rdquo; nonsense. Just a clear score, specific
        bottlenecks, and actionable upgrades. Today it&apos;s live, it&apos;s
        free, and I want to share what I learned building it.
      </p>

      <h2>Why I Built This</h2>
      <p>
        I kept seeing the same question on r/buildapc and r/pcgaming: &ldquo;Is
        my CPU bottlenecking my GPU?&rdquo; The answers were always the same
        &mdash; &ldquo;depends on the game,&rdquo; &ldquo;check Task
        Manager,&rdquo; &ldquo;run UserBenchmark&rdquo; (which is{" "}
        <a
          href="https://www.reddit.com/r/buildapc/comments/g2bpa6/"
          target="_blank"
          rel="noopener noreferrer"
        >
          notoriously unreliable
        </a>
        ).
      </p>
      <p>
        Nobody was giving a straight answer because the question is genuinely
        nuanced. A bottleneck depends on your exact CPU + GPU pairing, your RAM
        speed, your storage type, your BIOS settings, and what games you play.
        So I figured: why not build something that actually checks all of that?
      </p>

      <h2>How It Works</h2>
      <p>
        The tool has two parts: a lightweight Windows scanner and a web-based
        analyzer.
      </p>

      <h3>The Scanner</h3>
      <p>
        A portable .exe (no install) that reads your hardware configuration in
        about 10 seconds. It collects:
      </p>
      <ul>
        <li>CPU model, base/boost clocks, core count, current utilization</li>
        <li>GPU model, VRAM, driver version, current temps</li>
        <li>
          RAM amount, speed, and whether XMP/EXPO is enabled (this one matters
          more than most people think)
        </li>
        <li>Storage type (NVMe vs SATA SSD vs HDD) and capacity</li>
        <li>
          System settings: power plan, background processes, Windows version
        </li>
      </ul>
      <p>
        It outputs a JSON file to your Desktop. No data is sent anywhere
        &mdash; everything stays on your machine until you choose to upload it.
      </p>

      <h3>The Analyzer</h3>
      <p>
        Drag the JSON into the{" "}
        <Link href="/dashboard" className="text-cyan underline">
          web dashboard
        </Link>{" "}
        and you get:
      </p>
      <ul>
        <li>
          <strong>A score from 0&ndash;100</strong> with a letter grade (A
          through F) and per-component breakdown
        </li>
        <li>
          <strong>Specific bottleneck cards</strong> ranked by severity &mdash;
          critical issues in red, warnings in amber, optimizations in blue
        </li>
        <li>
          <strong>Tiered recommendations</strong>: free fixes first (BIOS
          settings, driver updates, Windows tweaks), then cheap fixes, then
          hardware upgrades with Amazon links and price estimates
        </li>
        <li>
          <strong>An upgrade simulator</strong> &mdash; &ldquo;What if I swapped
          to an RTX 4070?&rdquo; See the score change before spending money
        </li>
        <li>
          <strong>Game FPS estimates</strong> for 20 popular titles at different
          resolutions and quality settings
        </li>
        <li>
          <strong>AI deep analysis</strong> powered by Claude that explains
          everything in plain English and gives you a prioritized action plan
        </li>
      </ul>

      <h2>The Scoring System</h2>
      <p>
        I spent the most time on making the scoring feel right. The engine runs
        15+ rules that check for real-world bottlenecks:
      </p>
      <ul>
        <li>
          <strong>CPU/GPU mismatch</strong> &mdash; pairing a $500 GPU with a
          $100 CPU? That&apos;s an automatic critical flag.
        </li>
        <li>
          <strong>RAM running at JEDEC defaults</strong> &mdash; most people
          don&apos;t realize their 3600 MHz RAM is actually running at 2133 MHz
          because XMP isn&apos;t enabled. This alone can cost you 15&ndash;25%
          FPS.
        </li>
        <li>
          <strong>Thermal throttling detection</strong> &mdash; if your CPU is
          hitting 95&deg;C+, the best GPU in the world won&apos;t help.
        </li>
        <li>
          <strong>Storage bottleneck</strong> &mdash; still running games off an
          HDD? Modern open-world games load assets dynamically, and a slow drive
          causes stuttering even with a fast CPU and GPU.
        </li>
        <li>
          <strong>BIOS misconfigurations</strong> &mdash; Resizable BAR
          disabled, power limits throttled, legacy boot mode. All free fixes
          that most people miss.
        </li>
      </ul>

      <h2>What Surprised Me</h2>

      <h3>RAM Speed Is the #1 Free Fix</h3>
      <p>
        After analyzing hundreds of systems during beta, the single most common
        bottleneck is RAM running at JEDEC defaults instead of XMP/EXPO speeds.
        It affects roughly 60% of gaming PCs I&apos;ve seen. The fix takes 30
        seconds in BIOS and costs nothing.
      </p>
      <p>
        I added{" "}
        <Link href="/dashboard" className="text-cyan underline">
          per-motherboard BIOS guides
        </Link>{" "}
        for ASUS, MSI, Gigabyte, ASRock, EVGA, Biostar, and a generic guide.
        Each one tells you the exact menu path for your board.
      </p>

      <h3>People Overspend on GPUs</h3>
      <p>
        The most common pairing I see is a $400+ GPU with DDR4-2133 RAM and an
        entry-level CPU. The GPU is running at 60% utilization because the CPU
        can&apos;t feed it frames fast enough. A $280 CPU upgrade would
        unlock 30&ndash;40% more FPS &mdash; but most people&apos;s instinct is
        to buy an even bigger GPU.
      </p>

      <h3>The Upgrade Simulator Changed Everything</h3>
      <p>
        The feature I almost didn&apos;t build ended up being the most useful.
        You can pick any CPU or GPU from a database of 160+ components and see
        how your score would change. It prevents the classic mistake of spending
        $600 on a GPU upgrade when a $150 RAM upgrade would have given you
        80% of the gains.
      </p>

      <h2>Tech Stack (For the Nerds)</h2>
      <p>
        If you&apos;re a developer curious about the implementation:
      </p>
      <ul>
        <li>
          <strong>Scanner</strong>: Python + psutil + GPUtil + WMI, packaged
          with PyInstaller into a standalone .exe
        </li>
        <li>
          <strong>Web app</strong>: Next.js 16, React 19, TypeScript, Tailwind
          CSS, Framer Motion
        </li>
        <li>
          <strong>Analysis engine</strong>: 15+ rule-based checks that run
          client-side (no server needed for the basic analysis)
        </li>
        <li>
          <strong>AI analysis</strong>: Claude Haiku via streaming API for
          the deep analysis feature
        </li>
        <li>
          <strong>Hardware database</strong>: ~80 CPUs and ~85 GPUs with
          benchmark scores, TDP, pricing, and generation data
        </li>
      </ul>

      <h2>What&apos;s Next</h2>
      <p>Some features I&apos;m working on or considering:</p>
      <ul>
        <li>
          <strong>Live monitoring mode</strong> &mdash; already built, tracks
          CPU/GPU temps and usage in real-time while you game
        </li>
        <li>
          <strong>PCPartPicker import</strong> &mdash; paste your build list and
          get a bottleneck analysis before you buy
        </li>
        <li>
          <strong>Community benchmarks</strong> &mdash; anonymized data from
          scans to show how your system compares to others with similar hardware
        </li>
      </ul>

      <h2>Try It</h2>
      <p>
        The tool is completely free during beta &mdash; no paywalls, no signup,
        no data collection.{" "}
        <Link href="/dashboard" className="text-cyan underline">
          Open the dashboard
        </Link>
        , run the scanner, upload your results, and find out exactly what&apos;s
        bottlenecking your PC. If you don&apos;t have the scanner yet, there&apos;s
        a demo mode that shows what the analysis looks like with sample data.
      </p>
      <p>
        If you find it useful, I&apos;d genuinely appreciate you sharing it with
        anyone who&apos;s asked &ldquo;should I upgrade my GPU?&rdquo; &mdash;
        this tool exists specifically to answer that question.
      </p>
    </>
  );
}
