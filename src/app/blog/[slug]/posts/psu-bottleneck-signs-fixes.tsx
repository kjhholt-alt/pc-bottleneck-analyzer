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

export function PsuBottleneckSignsFixes() {
  return (
    <>
      <p>
        You&apos;ve upgraded your GPU, added faster RAM, and even swapped in an
        NVMe SSD &mdash; but something still isn&apos;t right. Games crash to
        desktop without warning, your PC shuts off under load, or your shiny new
        graphics card isn&apos;t hitting the frame rates reviewers promised. The
        culprit might be the most overlooked component in your entire build:{" "}
        <strong>your power supply (PSU)</strong>.
      </p>
      <p>
        A PSU bottleneck doesn&apos;t show up in Task Manager or MSI
        Afterburner. There&apos;s no &quot;PSU usage: 98%&quot; metric to
        monitor. That makes it one of the hardest bottlenecks to diagnose
        &mdash; and one of the most damaging when ignored. This guide covers the
        warning signs, how to confirm the problem, and the best PSU upgrades at
        every budget in 2026.
      </p>

      <h2>What Is a PSU Bottleneck?</h2>
      <p>
        A <strong>PSU bottleneck</strong> occurs when your power supply
        can&apos;t deliver enough clean, stable power to your components under
        load. Unlike a CPU or GPU bottleneck where one component limits
        another&apos;s performance, a PSU bottleneck can affect{" "}
        <strong>your entire system at once</strong> &mdash; causing crashes,
        throttling, instability, and even hardware damage over time.
      </p>
      <p>
        Modern high-end GPUs are power-hungry. An{" "}
        <A name="RTX 4090" /> can draw over 450W on its own during
        transient spikes. Pair that with a power-hungry CPU, RGB fans, multiple
        drives, and a 650W PSU from 2019, and you&apos;re running on borrowed
        time.
      </p>

      <h2>5 Signs Your PSU Is Bottlenecking Your PC</h2>

      <h3>1. Random Shutdowns Under Heavy Load</h3>
      <p>
        The most classic sign of PSU inadequacy. Your PC runs fine at idle or
        during light tasks, but the moment you launch a demanding game, start a
        render, or run a stress test, the system powers off instantly &mdash; no
        blue screen, no error message, just a hard shutdown as if someone pulled
        the plug.
      </p>
      <p>
        This happens when total power draw exceeds your PSU&apos;s capacity and
        its over-power protection (OPP) trips. Cheap PSUs may not even have
        proper protection &mdash; they just shut down or, worse, continue
        operating outside safe limits.
      </p>
      <p>
        <strong>Key distinction:</strong> If you get a blue screen (BSOD),
        that&apos;s usually a driver, RAM, or software issue. A PSU failure
        causes an <em>instant, complete</em> power loss with no warning.
      </p>

      <h3>2. System Crashes or Reboots During GPU-Intensive Tasks</h3>
      <p>
        Modern GPUs don&apos;t draw power smoothly &mdash; they have{" "}
        <strong>transient power spikes</strong> that can briefly exceed their
        rated TDP by 2&ndash;3x. NVIDIA&apos;s RTX 40-series cards are
        especially notorious for this. A GPU rated at 320W TDP might spike to
        600W+ for a few milliseconds during intense scenes.
      </p>
      <p>
        If your PSU can&apos;t handle these microsecond spikes, you&apos;ll
        experience crashes, black screens, or reboots specifically during
        gaming or GPU benchmarks &mdash; even if your PSU&apos;s total wattage
        looks sufficient on paper.
      </p>
      <p>
        <strong>Test it:</strong> Run{" "}
        <a
          href="https://www.3dmark.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan underline"
        >
          3DMark Time Spy Extreme
        </a>{" "}
        or FurMark. If your PC crashes within minutes but runs fine during
        normal desktop use, transient spikes are overwhelming your PSU.
      </p>

      <h3>3. Coil Whine That Gets Worse Over Time</h3>
      <p>
        Some coil whine from a GPU or PSU is normal, but if it&apos;s getting
        progressively louder or more erratic, your PSU may be struggling. When
        a PSU operates near its maximum capacity, its internal components
        vibrate more aggressively, producing audible noise.
      </p>
      <p>
        Specifically, listen for coil whine that only appears under load and
        wasn&apos;t present when the system was new (or before a GPU upgrade).
        This suggests the PSU is being pushed harder than it was designed for.
      </p>

      <h3>4. GPU or CPU Not Reaching Advertised Boost Clocks</h3>
      <p>
        Your <A name="RTX 4070 Ti Super" /> is supposed to boost to
        2610 MHz, but it only hits 2400 MHz in games. Or your CPU keeps
        dropping below its rated boost clock under load. Before blaming
        thermals, check your PSU.
      </p>
      <p>
        When a PSU delivers unstable voltage on the 12V rail (the one that
        powers your CPU and GPU), components may{" "}
        <strong>clock down to protect themselves</strong>. This is a subtle
        form of PSU bottleneck &mdash; your hardware is technically working,
        just not at full potential. You lose 5&ndash;15% performance without any
        obvious error or crash.
      </p>
      <p>
        <strong>How to check:</strong> Use{" "}
        <a
          href="https://www.hwinfo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan underline"
        >
          HWiNFO64
        </a>{" "}
        and monitor the 12V rail voltage while gaming. It should stay between
        11.4V and 12.6V (ATX spec is &plusmn;5%). If it drops below 11.4V or
        fluctuates wildly, your PSU is struggling.
      </p>

      <h3>5. New GPU Upgrade Causes Instability</h3>
      <p>
        Everything worked fine with your old GTX 1660 Super, but after
        upgrading to an <A name="RTX 4070 Super" />, you start
        experiencing crashes, artifacts, or random reboots. This is the most
        common trigger for a PSU bottleneck &mdash; a GPU upgrade that pushes
        total system power draw beyond what the PSU can handle.
      </p>
      <p>
        Many builders calculate their PSU needs based on the GPU&apos;s TDP
        alone, forgetting to account for CPU power draw, RAM, fans, drives,
        and the crucial headroom needed for transient spikes. A good rule of
        thumb: your PSU should be rated for at least{" "}
        <strong>1.5&ndash;2x your system&apos;s total estimated power draw</strong>.
      </p>

      <h2>How to Confirm You Have a PSU Bottleneck</h2>
      <p>
        Since PSU usage isn&apos;t visible in standard monitoring software,
        diagnosing it requires a different approach:
      </p>

      <h3>Method 1: Use Our Free PC Bottleneck Analyzer</h3>
      <p>
        The fastest way to check if your PSU is a limiting factor is to run our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          free PC Bottleneck Analyzer
        </Link>
        . It evaluates your entire system, including whether your power delivery
        can keep up with your other components, and flags PSU-related risks.
      </p>

      <h3>Method 2: Calculate Your Actual Power Draw</h3>
      <p>
        Add up the rated TDP of every component in your system:
      </p>
      <ul>
        <li>
          <strong>CPU TDP</strong> &mdash; Check your specific model (e.g.,
          Intel i7-14700K = 253W max turbo power)
        </li>
        <li>
          <strong>GPU TDP</strong> &mdash; Check the manufacturer spec (e.g.,
          RTX 4080 Super = 320W)
        </li>
        <li>
          <strong>RAM</strong> &mdash; ~5W per stick (DDR5 slightly higher)
        </li>
        <li>
          <strong>Storage</strong> &mdash; NVMe SSD ~7W, SATA SSD ~3W, HDD ~10W
        </li>
        <li>
          <strong>Fans + RGB</strong> &mdash; ~3&ndash;5W per fan, RGB strips
          ~5W each
        </li>
        <li>
          <strong>Motherboard</strong> &mdash; ~50&ndash;80W
        </li>
      </ul>
      <p>
        If your total exceeds 80% of your PSU&apos;s rated wattage, you&apos;re
        in the danger zone. PSUs are most efficient and stable at 50&ndash;80%
        load. Running consistently above 80% reduces lifespan and increases
        instability risk.
      </p>

      <h3>Method 3: Use a Kill-A-Watt Meter</h3>
      <p>
        A{" "}
        <A name="Kill A Watt electricity usage monitor" /> ($20&ndash;$30)
        plugs between your PC and the wall outlet and shows real-time power
        draw. Run a stress test (Prime95 + FurMark simultaneously) and note the
        peak wattage.
      </p>
      <p>
        <strong>Important:</strong> Wall draw is higher than internal component
        draw because of PSU efficiency losses. An 80 Plus Gold PSU at 50% load
        is ~90% efficient, meaning 650W from the wall delivers ~585W to
        components. Factor this in when comparing your meter reading to your
        PSU&apos;s rated output.
      </p>

      <h3>Method 4: The Undervolting Test</h3>
      <p>
        Temporarily undervolt your GPU using MSI Afterburner (reduce power
        limit to 70&ndash;80%). If your crashes and instability{" "}
        <strong>disappear</strong>, the PSU was the problem &mdash; reducing
        power draw gave it enough headroom.
      </p>

      <h2>PSU Efficiency Ratings Explained</h2>
      <p>
        Not all PSUs are created equal, even at the same wattage. The 80 Plus
        certification system rates PSU efficiency:
      </p>

      <table>
        <thead>
          <tr>
            <th>Rating</th>
            <th>Efficiency at 50% Load</th>
            <th>Typical Price Premium</th>
            <th>Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>80 Plus (White)</td>
            <td>80%</td>
            <td>Baseline</td>
            <td>Budget office PCs</td>
          </tr>
          <tr>
            <td>80 Plus Bronze</td>
            <td>85%</td>
            <td>+$10&ndash;15</td>
            <td>Budget gaming builds</td>
          </tr>
          <tr>
            <td>80 Plus Gold</td>
            <td>90%</td>
            <td>+$20&ndash;35</td>
            <td>Most gaming &amp; workstation PCs</td>
          </tr>
          <tr>
            <td>80 Plus Platinum</td>
            <td>92%</td>
            <td>+$40&ndash;60</td>
            <td>High-end / always-on systems</td>
          </tr>
          <tr>
            <td>80 Plus Titanium</td>
            <td>94%</td>
            <td>+$80&ndash;120</td>
            <td>Enthusiast &amp; server workloads</td>
          </tr>
        </tbody>
      </table>

      <p>
        Higher efficiency means less wasted heat, lower electricity bills, and
        more stable voltage delivery. For gaming PCs, <strong>80 Plus Gold</strong> is
        the sweet spot &mdash; it offers excellent efficiency without the
        diminishing returns of Platinum or Titanium.
      </p>

      <h2>How Much PSU Wattage Do You Actually Need?</h2>
      <p>
        Here are recommended PSU wattages for common 2026 gaming builds:
      </p>

      <table>
        <thead>
          <tr>
            <th>Build Tier</th>
            <th>Example Config</th>
            <th>Estimated Draw</th>
            <th>Recommended PSU</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Budget 1080p</td>
            <td>i5-14400F + RTX 4060</td>
            <td>~300W</td>
            <td>550W</td>
          </tr>
          <tr>
            <td>Mid-range 1440p</td>
            <td>R7 7800X3D + RTX 4070 Super</td>
            <td>~400W</td>
            <td>750W</td>
          </tr>
          <tr>
            <td>High-end 4K</td>
            <td>i7-14700K + RTX 4080 Super</td>
            <td>~550W</td>
            <td>850W</td>
          </tr>
          <tr>
            <td>Enthusiast</td>
            <td>i9-14900K + RTX 4090</td>
            <td>~700W</td>
            <td>1000W+</td>
          </tr>
        </tbody>
      </table>

      <p>
        Notice the recommended wattage is significantly higher than estimated
        draw. This accounts for transient spikes, aging degradation (PSUs lose
        capacity over time), and future upgrade headroom. <strong>Never buy
        a PSU that exactly matches your power draw.</strong>
      </p>

      <h2>How to Fix a PSU Bottleneck</h2>

      <h3>Free Fixes (Try These First)</h3>
      <ul>
        <li>
          <strong>Undervolt your GPU</strong> &mdash; Reducing the power limit
          to 85&ndash;90% in MSI Afterburner typically costs only 3&ndash;5% FPS
          but can drop power draw by 50&ndash;80W. This alone may eliminate
          crashes caused by transient spikes.
        </li>
        <li>
          <strong>Enable Efficiency Mode for your CPU</strong> &mdash; In BIOS,
          set power limits to PBP (base power) instead of MTP (max turbo
          power). An i7-14700K drops from 253W to 125W with only ~8% gaming
          performance loss.
        </li>
        <li>
          <strong>Remove unused drives and peripherals</strong> &mdash; Every
          connected device draws power. Unplug hard drives you don&apos;t use,
          disconnect RGB controllers, and remove extra fans if airflow allows.
        </li>
        <li>
          <strong>Check all power cable connections</strong> &mdash; A loose
          24-pin ATX, 8-pin CPU, or PCIe power connector can cause instability
          that mimics a wattage shortage. Reseat every power connection.
        </li>
      </ul>

      <h3>Hardware Upgrade: Best PSUs for Every Budget (2026)</h3>
      <p>
        If your PSU genuinely can&apos;t handle your hardware, it&apos;s time to
        upgrade. <strong>Do not cheap out on your PSU</strong> &mdash;
        it&apos;s the one component that can destroy everything else if it
        fails.
      </p>

      <h4>Budget (550&ndash;650W) &mdash; For 1080p Gaming</h4>
      <ul>
        <li>
          <A name="Corsair RM650e 650W 80 Plus Gold" /> (~$80) &mdash; Fully
          modular, quiet fan, 10-year warranty. Gold standard for budget
          gaming builds.
        </li>
        <li>
          <A name="Thermaltake Toughpower GF3 650W" /> (~$75) &mdash; ATX 3.0
          with native 12VHPWR connector, ready for next-gen GPUs.
        </li>
      </ul>

      <h4>Mid-Range (750&ndash;850W) &mdash; For 1440p Gaming</h4>
      <ul>
        <li>
          <A name="Corsair RM850x 850W 80 Plus Gold" /> (~$130) &mdash;
          Best-selling for good reason. Fully modular, incredibly quiet, and
          handles transient spikes like a champ.
        </li>
        <li>
          <A name="be quiet! Straight Power 12 850W" /> (~$140) &mdash; German
          engineering, platinum-level ripple suppression, near-silent operation.
        </li>
        <li>
          <A name="Seasonic Focus GX-850 850W 80 Plus Gold" /> (~$120)
          &mdash; Legendary reliability, 10-year warranty, compact form factor.
        </li>
      </ul>

      <h4>High-End (1000W+) &mdash; For 4K Gaming &amp; Workstations</h4>
      <ul>
        <li>
          <A name="Corsair RM1000x 1000W 80 Plus Gold" /> (~$180) &mdash;
          Future-proof for RTX 4090 and next-gen GPUs. ATX 3.0 with native
          12VHPWR.
        </li>
        <li>
          <A name="be quiet! Dark Power 13 1000W" /> (~$220) &mdash; 80 Plus
          Titanium efficiency, frameless fan design, built for enthusiast rigs.
        </li>
        <li>
          <A name="Seasonic Prime TX-1000 1000W 80 Plus Titanium" /> (~$250)
          &mdash; The best PSU money can buy. 12-year warranty, virtually
          zero ripple, and rock-solid voltage regulation.
        </li>
      </ul>

      <h2>ATX 3.0 and the 12VHPWR Connector: Do You Need It?</h2>
      <p>
        If you&apos;re buying a new PSU in 2026, get one with the{" "}
        <strong>ATX 3.0 / ATX 3.1 standard</strong> and a{" "}
        <strong>native 12V-2x6 (12VHPWR) connector</strong>. Here&apos;s why:
      </p>
      <ul>
        <li>
          <strong>ATX 3.0 PSUs handle transient spikes up to 200%</strong>{" "}
          &mdash; They&apos;re designed for the bursty power draw of modern GPUs
          and won&apos;t trip protection during brief spikes.
        </li>
        <li>
          <strong>Native 12VHPWR eliminates adapter risks</strong> &mdash; The
          early 12VHPWR adapters from dual 8-pin cables were prone to melting.
          A native cable from a quality PSU is much safer.
        </li>
        <li>
          <strong>Future-proof</strong> &mdash; Next-gen NVIDIA and AMD GPUs
          will continue using 12V-2x6 connectors. An ATX 3.0 PSU will last you
          through multiple GPU upgrades.
        </li>
      </ul>

      <h2>How Long Do PSUs Last? When to Replace</h2>
      <p>
        Quality PSUs typically last 7&ndash;10 years, but their capacity
        degrades over time. A 750W PSU from 2018 might only deliver
        650&ndash;680W reliably today due to capacitor aging. Replace your PSU
        if:
      </p>
      <ul>
        <li>It&apos;s more than 7 years old</li>
        <li>It doesn&apos;t have an 80 Plus rating (or only 80 Plus White)</li>
        <li>It&apos;s a no-name brand without proper safety certifications</li>
        <li>You&apos;ve upgraded your GPU or CPU significantly since buying it</li>
        <li>You hear clicking, buzzing, or smell burning from the PSU</li>
        <li>
          It uses non-modular cables and you can&apos;t confirm the wattage is
          sufficient
        </li>
      </ul>
      <p>
        <strong>Warning:</strong> Never reuse modular PSU cables between
        different PSU models. The pinouts differ between manufacturers (and even
        between models from the same brand). Using the wrong cables can
        instantly destroy your components.
      </p>

      <h2>Stop Guessing &mdash; Scan Your System Now</h2>
      <p>
        Not sure if your PSU is holding your system back? Our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          free PC Bottleneck Analyzer
        </Link>{" "}
        scans your hardware, evaluates your power delivery against your
        component demands, and tells you exactly where the weak link is &mdash;
        with specific upgrade recommendations and estimated performance gains.
      </p>
      <p>
        No signup required. Run the scanner and get your personalized results in
        60 seconds.
      </p>
    </>
  );
}
