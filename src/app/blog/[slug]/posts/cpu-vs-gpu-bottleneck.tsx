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

export function CpuVsGpuBottleneck() {
  return (
    <>
      <p>
        You&apos;ve spent hundreds or thousands on a gaming PC, but performance
        isn&apos;t what you expected. Games stutter, frame rates drop, and the
        experience feels... off. The problem? A <strong>bottleneck</strong> —
        and knowing whether it&apos;s your CPU or GPU is the difference between
        a smart upgrade and wasted money.
      </p>
      <p>
        This guide breaks down the CPU bottleneck vs GPU bottleneck debate with
        real-world scenarios, diagnostic tools, and specific fixes for each. By
        the end, you&apos;ll know exactly which component is holding your system
        back and what to do about it.
      </p>

      <h2>What Is a CPU Bottleneck?</h2>
      <p>
        A <strong>CPU bottleneck</strong> happens when your processor
        can&apos;t deliver instructions to your GPU fast enough. The GPU sits
        idle, waiting for the CPU to catch up. This is most common in:
      </p>
      <ul>
        <li>
          <strong>High-refresh-rate gaming at 1080p</strong> — Pushing 144+ FPS
          is extremely CPU-intensive
        </li>
        <li>
          <strong>CPU-heavy games</strong> — Open-world titles (Cyberpunk 2077,
          Starfield), simulation games (Cities: Skylines), and competitive
          shooters with high player counts
        </li>
        <li>
          <strong>Budget builds with powerful GPUs</strong> — Pairing a $500
          GPU with a $150 CPU creates an instant bottleneck
        </li>
        <li>
          <strong>Older CPUs paired with modern GPUs</strong> — A 6-year-old i5
          paired with an RTX 4070 will choke
        </li>
      </ul>
      <p>
        <strong>Key symptom:</strong> Your GPU usage stays below 80% while
        gaming, even at max settings. The CPU is pinned at 90-100% across most
        cores.
      </p>

      <h2>What Is a GPU Bottleneck?</h2>
      <p>
        A <strong>GPU bottleneck</strong> happens when your graphics card
        can&apos;t render frames fast enough to keep up with your CPU. The GPU
        is maxed out while the CPU has headroom. This is most common in:
      </p>
      <ul>
        <li>
          <strong>High-resolution gaming</strong> — 1440p and 4K gaming pushes
          all the work onto the GPU
        </li>
        <li>
          <strong>Graphics-intensive games</strong> — AAA titles with ray
          tracing (Cyberpunk 2077 with path tracing, Alan Wake 2)
        </li>
        <li>
          <strong>Productivity systems repurposed for gaming</strong> — A strong
          CPU paired with integrated graphics or an entry-level GPU
        </li>
        <li>
          <strong>Older GPUs paired with modern CPUs</strong> — A GTX 1060
          paired with an i7-14700K will struggle in modern titles
        </li>
      </ul>
      <p>
        <strong>Key symptom:</strong> Your GPU usage sits at 95-100% constantly,
        while CPU usage is well below 50%. Lowering resolution or graphics
        settings dramatically boosts FPS.
      </p>

      <h2>CPU Bottleneck vs GPU Bottleneck: Side-by-Side Comparison</h2>
      <p>
        Here&apos;s a complete breakdown of the differences between a CPU
        bottleneck and a GPU bottleneck:
      </p>

      <table>
        <thead>
          <tr>
            <th>Symptom</th>
            <th>CPU Bottleneck</th>
            <th>GPU Bottleneck</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GPU usage during gaming</td>
            <td>60-80% (underutilized)</td>
            <td>95-100% (maxed out)</td>
          </tr>
          <tr>
            <td>CPU usage during gaming</td>
            <td>90-100% (maxed out)</td>
            <td>30-60% (headroom available)</td>
          </tr>
          <tr>
            <td>Effect of lowering resolution</td>
            <td>
              <strong>No change</strong> in FPS
            </td>
            <td>
              <strong>Significant increase</strong> in FPS
            </td>
          </tr>
          <tr>
            <td>Effect of lowering graphics settings</td>
            <td>Minimal or no FPS gain</td>
            <td>Large FPS increase</td>
          </tr>
          <tr>
            <td>Frame pacing</td>
            <td>Stutters, low 1% lows</td>
            <td>Smooth but low overall FPS</td>
          </tr>
          <tr>
            <td>Most affected by</td>
            <td>Game logic, physics, AI</td>
            <td>Resolution, ray tracing, textures</td>
          </tr>
          <tr>
            <td>Typical scenario</td>
            <td>1080p high refresh rate (144Hz+)</td>
            <td>1440p/4K gaming with high settings</td>
          </tr>
          <tr>
            <td>Common in</td>
            <td>Budget builds, older CPUs</td>
            <td>High-res gaming, older GPUs</td>
          </tr>
        </tbody>
      </table>

      <h2>Real-World Scenarios: When You&apos;ll See Each Bottleneck</h2>

      <h3>Gaming Scenario: Competitive Shooter at 1080p 240Hz</h3>
      <p>
        <strong>Game:</strong> Valorant, CS2, Apex Legends
        <br />
        <strong>Target:</strong> 240+ FPS at 1080p
        <br />
        <strong>Likely bottleneck:</strong> <strong>CPU</strong>
      </p>
      <p>
        At high refresh rates, the CPU has to process 240+ frames worth of game
        logic per second. Even a mid-range GPU like an{" "}
        <A name="RTX 4060" /> can handle 1080p easily, but a{" "}
        <A name="Ryzen 5 5600" /> or older will struggle to keep up.
      </p>
      <p>
        <strong>Fix:</strong> Upgrade to a high-frequency CPU like the{" "}
        <A name="Intel Core i5-14600K" /> (5.3 GHz boost) or{" "}
        <A name="AMD Ryzen 7 7800X3D" /> (3D V-Cache for gaming).
      </p>

      <h3>Gaming Scenario: AAA Title at 4K Ultra</h3>
      <p>
        <strong>Game:</strong> Cyberpunk 2077 with path tracing, Red Dead
        Redemption 2 maxed out
        <br />
        <strong>Target:</strong> 60 FPS at 4K
        <br />
        <strong>Likely bottleneck:</strong> <strong>GPU</strong>
      </p>
      <p>
        4K resolution is 2.25x more pixels than 1440p and 4x more than 1080p.
        Even a flagship CPU like the <A name="Intel Core i9-14900K" /> will sit
        at 40% usage while your GPU is pinned at 100% trying to render
        8.3 million pixels per frame.
      </p>
      <p>
        <strong>Fix:</strong> Upgrade to a high-end GPU like the{" "}
        <A name="RTX 4080 Super" /> or <A name="RTX 4090" /> for 4K gaming.
        Alternatively, use DLSS or FSR to reduce render resolution.
      </p>

      <h3>Streaming Scenario: Gaming + OBS Encoding</h3>
      <p>
        <strong>Task:</strong> Playing Warzone while streaming 1080p60 to Twitch
        <br />
        <strong>Likely bottleneck:</strong>{" "}
        <strong>CPU (if using x264 encoding)</strong> or{" "}
        <strong>GPU (if using NVENC/VCE)</strong>
      </p>
      <p>
        If you&apos;re using x264 (CPU encoding) for higher quality, your CPU
        has to handle game logic AND video encoding simultaneously. A 6-core CPU
        will struggle. If you&apos;re using NVENC (NVIDIA GPU encoding) or VCE
        (AMD GPU encoding), the GPU handles both gaming and encoding &mdash;
        which can push it to 100% usage.
      </p>
      <p>
        <strong>Fix for CPU bottleneck:</strong> Upgrade to an 8+ core CPU like
        the <A name="AMD Ryzen 7 7700X" /> or switch to GPU-based encoding.
        <br />
        <strong>Fix for GPU bottleneck:</strong> Lower in-game settings or use a
        two-PC streaming setup with a capture card.
      </p>

      <h3>Rendering Scenario: Blender GPU Render (Cycles)</h3>
      <p>
        <strong>Task:</strong> Rendering a 3D scene with Cycles (GPU path
        tracing)
        <br />
        <strong>Likely bottleneck:</strong> <strong>GPU</strong>
      </p>
      <p>
        Blender Cycles, Octane, and Redshift offload almost all rendering to the
        GPU. Your CPU handles scene setup and denoising, but the GPU does the
        heavy lifting. A weak GPU will add hours to render times.
      </p>
      <p>
        <strong>Fix:</strong> Upgrade to a CUDA-capable NVIDIA GPU with high
        VRAM. The <A name="RTX 4070 Ti Super" /> (16 GB) or{" "}
        <A name="RTX 4080 Super" /> (16 GB) are excellent for rendering. For
        budget builds, the <A name="RTX 4060 Ti 16GB" /> offers solid VRAM at a
        lower price.
      </p>

      <h3>Rendering Scenario: Video Editing (DaVinci Resolve)</h3>
      <p>
        <strong>Task:</strong> Editing 4K footage with color grading and effects
        <br />
        <strong>Likely bottleneck:</strong>{" "}
        <strong>Both (CPU for timeline playback, GPU for effects)</strong>
      </p>
      <p>
        DaVinci Resolve is hybrid-accelerated. The CPU handles decoding, audio
        sync, and timeline scrubbing. The GPU accelerates color grading, noise
        reduction, and effects. A weak CPU causes choppy playback; a weak GPU
        slows down rendering and real-time previews.
      </p>
      <p>
        <strong>Fix:</strong> Balance your build. Pair a strong CPU like the{" "}
        <A name="AMD Ryzen 9 9900X" /> with a capable GPU like the{" "}
        <A name="RTX 4070 Super" /> for smooth 4K editing.
      </p>

      <h2>How to Diagnose Which Bottleneck You Have</h2>
      <p>
        Don&apos;t guess &mdash; <strong>measure</strong>. Here&apos;s how to
        identify whether you have a CPU bottleneck or a GPU bottleneck:
      </p>

      <h3>Method 1: Use Our Free PC Bottleneck Analyzer</h3>
      <p>
        The fastest way to diagnose your exact bottleneck is to run our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          free PC Bottleneck Analyzer
        </Link>
        . It scans your hardware, scores each component, and tells you exactly
        which part is limiting performance &mdash; plus specific upgrade
        recommendations with price estimates.
      </p>

      <h3>Method 2: Monitor CPU and GPU Usage In-Game</h3>
      <p>
        <strong>Tools:</strong> MSI Afterburner + RivaTuner, or Windows Task
        Manager
      </p>
      <ol>
        <li>
          Download and install{" "}
          <a
            href="https://www.msi.com/Landing/afterburner"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan underline"
          >
            MSI Afterburner
          </a>{" "}
          (includes RivaTuner overlay)
        </li>
        <li>Enable the on-screen display (OSD) to show CPU and GPU usage</li>
        <li>
          Launch a demanding game and play for 5-10 minutes while monitoring
          usage
        </li>
        <li>
          <strong>CPU at 90-100%, GPU below 80%?</strong> CPU bottleneck.
        </li>
        <li>
          <strong>GPU at 95-100%, CPU below 60%?</strong> GPU bottleneck.
        </li>
        <li>
          <strong>Both at 80-95%?</strong> Congratulations, your system is
          well-balanced!
        </li>
      </ol>

      <h3>Method 3: The Resolution Test</h3>
      <p>
        This is the simplest manual test to determine whether you have a CPU
        or GPU bottleneck:
      </p>
      <ol>
        <li>Run a game at your current resolution (e.g., 1440p)</li>
        <li>Note your average FPS</li>
        <li>Lower the resolution to 1080p (or from 1080p to 720p)</li>
        <li>Run the same benchmark or scene again</li>
      </ol>
      <p>
        <strong>Result interpretation:</strong>
      </p>
      <ul>
        <li>
          <strong>FPS increases significantly (20%+)?</strong> GPU bottleneck.
          Lowering resolution reduces GPU load, freeing up performance.
        </li>
        <li>
          <strong>FPS stays the same?</strong> CPU bottleneck. The GPU already
          had headroom; reducing resolution doesn&apos;t help because the CPU
          is the limit.
        </li>
      </ul>

      <h2>How to Fix a CPU Bottleneck</h2>
      <p>
        If you&apos;ve confirmed a CPU bottleneck, here are your options, ranked
        from free to expensive:
      </p>

      <h3>Free Fixes</h3>
      <ul>
        <li>
          <strong>Enable XMP/EXPO in BIOS</strong> — Unlocks your RAM&apos;s
          rated speed (typically 3200-6000 MHz instead of 2133 MHz default). Can
          add 10-25% FPS in CPU-bound games. Our{" "}
          <Link href="/dashboard" className="text-cyan underline">
            analyzer includes motherboard-specific BIOS guides
          </Link>
          .
        </li>
        <li>
          <strong>Close background apps</strong> — Discord, Chrome, RGB
          software, and hardware monitors all steal CPU cycles. Close what you
          don&apos;t need.
        </li>
        <li>
          <strong>Set Windows power plan to High Performance</strong> —
          Prevents CPU throttling during gaming. Control Panel → Power Options →
          High Performance.
        </li>
        <li>
          <strong>Disable Windows Game DVR and Game Bar</strong> — Windows
          records gameplay in the background, eating CPU time. Settings →
          Gaming → Game Bar → Off.
        </li>
        <li>
          <strong>Update chipset drivers</strong> — AMD and Intel regularly
          release updates that improve CPU scheduling and boost performance.
        </li>
      </ul>

      <h3>Low-Cost Fixes</h3>
      <ul>
        <li>
          <strong>Upgrade RAM speed</strong> — If you&apos;re on DDR4-2400 or
          slower, upgrading to DDR4-3600 or DDR5-6000 can add 10-20% FPS in
          CPU-bound scenarios. Example:{" "}
          <A name="Corsair Vengeance DDR5 6000MHz 32GB" /> ($110).
        </li>
        <li>
          <strong>Overclock your CPU</strong> — Free performance if you have an
          unlocked CPU (Intel K-series or AMD X-series) and a decent cooler.
          Can add 5-15% performance. Use guides for your specific CPU model.
        </li>
      </ul>

      <h3>Hardware Upgrades</h3>
      <p>
        If free and low-cost fixes aren&apos;t enough, it&apos;s time to upgrade
        your CPU:
      </p>
      <ul>
        <li>
          <strong>Best value (2026):</strong> <A name="Intel Core i5-14600K" />{" "}
          ($280) — 14 cores, 5.3 GHz boost, crushes gaming and productivity.
        </li>
        <li>
          <strong>Best for gaming:</strong> <A name="AMD Ryzen 7 9800X3D" />{" "}
          ($449) — 3D V-Cache gives 10-20% higher FPS in CPU-bound games
          compared to non-X3D CPUs.
        </li>
        <li>
          <strong>Budget option:</strong> <A name="Intel Core i3-14100F" />{" "}
          ($110) — 4 cores, great for 1080p gaming with mid-range GPUs.
        </li>
        <li>
          <strong>High-end workstation:</strong>{" "}
          <A name="AMD Ryzen 9 9900X" /> ($500) — 12 cores, dominates
          multi-threaded workloads like streaming, rendering, and compiling.
        </li>
      </ul>
      <p>
        <strong>Important:</strong> Check motherboard compatibility. Intel CPUs
        change sockets every 2 generations; AMD AM5 supports Ryzen 7000 and
        9000 series. You may need to upgrade your motherboard + RAM as well.
      </p>

      <h2>How to Fix a GPU Bottleneck</h2>
      <p>
        If you&apos;ve confirmed a GPU bottleneck, here are your options:
      </p>

      <h3>Free Fixes</h3>
      <ul>
        <li>
          <strong>Update GPU drivers</strong> — NVIDIA and AMD release
          game-specific optimizations regularly. A single driver update can add
          10-15% FPS in newly released AAA titles.
        </li>
        <li>
          <strong>Enable Resizable BAR / Smart Access Memory</strong> — Free
          5-10% GPU performance boost in supported games. Enable in BIOS under
          PCI settings (requires UEFI mode and compatible hardware).
        </li>
        <li>
          <strong>Lower resolution or use upscaling</strong> — DLSS (NVIDIA),
          FSR (AMD/universal), or XeSS (Intel) render at a lower resolution and
          upscale using AI. Can double your FPS with minimal visual loss.
        </li>
        <li>
          <strong>Turn off ray tracing</strong> — Ray tracing can cut FPS in
          half. Disabling it frees up massive GPU headroom.
        </li>
        <li>
          <strong>Lower graphics settings</strong> — Shadows, reflections, and
          ambient occlusion are GPU hogs. Dropping these from Ultra to High can
          add 20-30% FPS with barely noticeable visual difference.
        </li>
      </ul>

      <h3>Hardware Upgrades</h3>
      <p>
        If settings tweaks aren&apos;t enough, upgrade your GPU:
      </p>
      <ul>
        <li>
          <strong>Best value for 1080p:</strong> <A name="RTX 4060" /> ($299) or{" "}
          <A name="RX 7600" /> ($249) — both crush 1080p gaming at 60+ FPS.
        </li>
        <li>
          <strong>Best for 1440p:</strong> <A name="RTX 4070 Super" /> ($599) or{" "}
          <A name="RX 7800 XT" /> ($499) — excellent 1440p 120+ FPS
          performance.
        </li>
        <li>
          <strong>Best for 4K:</strong> <A name="RTX 4080 Super" /> ($999) —
          smooth 4K 60+ FPS in AAA titles with RT enabled.
        </li>
        <li>
          <strong>Halo option:</strong> <A name="RTX 4090" /> ($1,599) — the
          fastest consumer GPU for 4K 120 Hz gaming and professional rendering.
        </li>
        <li>
          <strong>Budget 1080p:</strong> <A name="RTX 3060" /> ($250 used) or{" "}
          <A name="RX 6650 XT" /> ($200 used) — great value on the used market
          for 1080p 60+ FPS.
        </li>
      </ul>
      <p>
        <strong>Pro tip:</strong> Check your PSU before upgrading. High-end GPUs
        like the RTX 4080 Super require 750W+ PSUs with proper 12VHPWR or dual
        8-pin connectors.
      </p>

      <h2>Common Myths About Bottlenecks</h2>

      <h3>Myth 1: &quot;You should always have a slight GPU bottleneck&quot;</h3>
      <p>
        <strong>Truth:</strong> This advice comes from the idea that you want
        your GPU to be the limiting factor (since it&apos;s easier to adjust
        graphics settings than CPU-bound settings). While there&apos;s some
        merit to this, the real goal is <strong>balance</strong>. A severe
        bottleneck of either type wastes money and performance.
      </p>

      <h3>Myth 2: &quot;Bottlenecks only matter in gaming&quot;</h3>
      <p>
        <strong>Truth:</strong> Bottlenecks affect every workload. Video editing
        can be CPU or GPU bottlenecked depending on the software. 3D rendering
        is almost always GPU-bound with modern engines. Even web browsing can be
        CPU-limited if you have 50+ tabs open.
      </p>

      <h3>Myth 3: &quot;Pairing a high-end GPU with a mid-range CPU always wastes the GPU&quot;</h3>
      <p>
        <strong>Truth:</strong> It depends on resolution and refresh rate. At
        4K 60 Hz, even a mid-range CPU like the{" "}
        <A name="Intel Core i5-13400F" /> ($180) won&apos;t bottleneck an{" "}
        <A name="RTX 4090" /> because the GPU is doing all the work. But at
        1080p 240 Hz? The CPU will choke hard.
      </p>

      <h2>Final Verdict: Which Is Worse?</h2>
      <p>
        Both CPU and GPU bottlenecks hurt performance, but{" "}
        <strong>a CPU bottleneck is often more noticeable</strong> because it
        causes stuttering, frame pacing issues, and low 1% lows — creating a
        choppy, inconsistent experience. A GPU bottleneck results in lower
        overall FPS, but frame pacing is usually smooth.
      </p>
      <p>
        That said, the "worse" bottleneck is whichever one you have. The good
        news? Now you know how to identify it, fix it, and build a balanced
        system going forward.
      </p>

      <h2>Stop Guessing — Scan Your System Now</h2>
      <p>
        The fastest way to find out whether you have a CPU bottleneck or a GPU
        bottleneck is to use our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          free PC Bottleneck Analyzer
        </Link>
        . It scans your hardware in 60 seconds, scores your system out of 100,
        and tells you exactly which component is holding you back — with
        specific upgrade recommendations and estimated performance gains.
      </p>
      <p>No signup required. Just run the tool and get your results instantly.</p>
    </>
  );
}
