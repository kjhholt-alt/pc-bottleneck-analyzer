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

export function ThermalThrottlingFixGuide() {
  return (
    <>
      <p>
        Your PC starts strong — smooth frame rates, snappy load times, everything
        feels fast. But after 20 minutes of gaming or a heavy render, performance
        tanks. Frame rates drop, the system stutters, and your fans sound like a
        jet engine. This is <strong>thermal throttling</strong>, and it&apos;s one
        of the most frustrating bottlenecks because it doesn&apos;t show up in
        standard hardware comparisons.
      </p>
      <p>
        Thermal throttling happens when your CPU or GPU gets too hot and
        automatically reduces its clock speed to prevent damage. Your hardware is
        literally slowing itself down to survive. The worst part? Many users
        mistake this for a hardware limitation and spend hundreds on upgrades when
        the real fix might cost $30.
      </p>
      <p>
        This guide covers how to identify thermal throttling, what causes it, and
        step-by-step fixes ranked from free to budget-friendly.
      </p>

      <h2>What Is Thermal Throttling?</h2>
      <p>
        Every CPU and GPU has a maximum safe operating temperature — called{" "}
        <strong>T<sub>j</sub> Max</strong> (junction temperature maximum) for
        CPUs. When the chip approaches this limit, it automatically reduces its
        clock speed and voltage to generate less heat. This is thermal throttling.
      </p>
      <p>
        For most modern processors, thermal throttling kicks in at these
        temperatures:
      </p>
      <ul>
        <li>
          <strong>Intel 13th/14th/15th Gen CPUs</strong> — Throttle at 100&deg;C
          (T<sub>j</sub> Max)
        </li>
        <li>
          <strong>AMD Ryzen 7000/9000 CPUs</strong> — Throttle at 95&deg;C (T
          <sub>ctl</sub> Max)
        </li>
        <li>
          <strong>NVIDIA RTX 40/50 Series GPUs</strong> — Throttle around
          83-87&deg;C (varies by model)
        </li>
        <li>
          <strong>AMD RX 7000/8000 Series GPUs</strong> — Throttle around
          90-100&deg;C (junction temperature)
        </li>
      </ul>
      <p>
        The key distinction: thermal throttling isn&apos;t damage — it&apos;s your
        hardware&apos;s self-preservation mechanism. But it means you&apos;re
        leaving significant performance on the table. A CPU that should boost to
        5.5 GHz might drop to 3.8 GHz under thermal pressure, costing you 20-40%
        of its potential performance.
      </p>

      <h2>5 Signs Your PC Is Thermal Throttling</h2>

      <h3>1. Performance Degrades Over Time</h3>
      <p>
        The most telltale sign. Your game runs at 120 FPS for the first 10
        minutes, then gradually drops to 80 FPS or lower. This pattern — strong
        start, slow decline — almost always points to thermal throttling. A true
        CPU or GPU bottleneck is consistent from the start; thermal throttling
        gets worse as heat builds up.
      </p>

      <h3>2. Clock Speeds Drop During Heavy Load</h3>
      <p>
        Open HWiNFO64 or MSI Afterburner while gaming and watch your CPU/GPU
        clock speeds. If your CPU is rated to boost to 5.4 GHz but drops to 4.0
        GHz after sustained load, that&apos;s throttling. GPU boost clocks should
        remain stable — if they drop from 2500 MHz to 2100 MHz during gameplay,
        heat is the reason.
      </p>

      <h3>3. Fans Ramp to Maximum Speed</h3>
      <p>
        When your fans suddenly get loud during gaming, your cooling system is
        working overtime to dissipate heat. If the fans are already maxed out and
        temperatures are still above 90&deg;C, your current cooling solution
        isn&apos;t adequate for your hardware.
      </p>

      <h3>4. Sudden Frame Drops or Stuttering</h3>
      <p>
        Unlike the gradual decline of consistent throttling, some systems
        experience sudden &quot;step-down&quot; throttling — the clock speed drops
        sharply when a temperature threshold is hit, then recovers briefly, then
        drops again. This creates a stuttery, inconsistent experience that feels
        different from a standard bottleneck.
      </p>

      <h3>5. Your PC Shuts Down During Intensive Tasks</h3>
      <p>
        If your PC powers off during gaming, rendering, or stress tests without
        warning, thermal protection is shutting it down to prevent hardware
        damage. This is more severe than throttling — it means your cooling
        has completely failed to keep temperatures safe.
      </p>

      <h2>How to Check Your Temperatures</h2>

      <h3>Method 1: Use Our Free PC Bottleneck Analyzer</h3>
      <p>
        The quickest way to check if thermal throttling is affecting your system
        is to run our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          free PC Bottleneck Analyzer
        </Link>
        . It reads your CPU and GPU temperatures, checks your cooling
        configuration, and flags thermal issues alongside other bottlenecks — all
        in one scan.
      </p>

      <h3>Method 2: Monitor with HWiNFO64</h3>
      <ol>
        <li>
          Download and install HWiNFO64 (free) — the most reliable hardware
          monitoring tool available
        </li>
        <li>
          Launch it in <strong>Sensors-only</strong> mode
        </li>
        <li>
          Find your CPU section and look for{" "}
          <strong>CPU Package</strong> or <strong>Core Max</strong> temperature
        </li>
        <li>
          Find your GPU section and look for{" "}
          <strong>GPU Temperature</strong> and{" "}
          <strong>GPU Hot Spot Temperature</strong>
        </li>
        <li>
          Run a game or stress test for 15-20 minutes and watch the{" "}
          <strong>Maximum</strong> column
        </li>
      </ol>

      <h3>Temperature Danger Zones</h3>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Safe Range</th>
            <th>Concerning</th>
            <th>Throttling Zone</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CPU (Intel)</td>
            <td>Under 80&deg;C</td>
            <td>80-95&deg;C</td>
            <td>95-100&deg;C</td>
          </tr>
          <tr>
            <td>CPU (AMD Ryzen)</td>
            <td>Under 75&deg;C</td>
            <td>75-90&deg;C</td>
            <td>90-95&deg;C</td>
          </tr>
          <tr>
            <td>GPU (NVIDIA)</td>
            <td>Under 75&deg;C</td>
            <td>75-83&deg;C</td>
            <td>83-87&deg;C</td>
          </tr>
          <tr>
            <td>GPU (AMD)</td>
            <td>Under 80&deg;C</td>
            <td>80-95&deg;C</td>
            <td>95-110&deg;C (junction)</td>
          </tr>
        </tbody>
      </table>

      <h2>What Causes Thermal Throttling?</h2>
      <p>
        Understanding the cause determines the fix. Here are the most common
        culprits, ranked from most to least frequent:
      </p>

      <h3>1. Inadequate CPU Cooler</h3>
      <p>
        This is the number one cause. Many builders pair a high-end CPU like
        the Intel Core i7-14700K or AMD Ryzen 9 9900X with the stock cooler or
        a budget tower cooler that can&apos;t handle sustained boost clocks.
        Modern CPUs are designed to consume 200W+ when given adequate cooling —
        but a cheap cooler limits them to 65-100W of actual sustained
        performance.
      </p>

      <h3>2. Dried-Out Thermal Paste</h3>
      <p>
        Thermal paste degrades over time. After 2-3 years, it dries out and
        loses conductivity, creating an insulating gap between your CPU and
        cooler. If your PC used to run cool but temperatures have gradually
        crept up over months, dried thermal paste is likely the cause. This is
        the cheapest fix — a tube of quality thermal paste costs $8-12.
      </p>

      <h3>3. Poor Case Airflow</h3>
      <p>
        Your components dump heat into the case, and if that hot air can&apos;t
        escape, it recirculates and raises the ambient temperature inside the
        case. Common airflow killers include: no intake fans (negative pressure),
        solid front panels that block airflow, cables blocking fan pathways, and
        dust buildup on filters and fan blades.
      </p>

      <h3>4. Dusty Heatsinks and Fans</h3>
      <p>
        Dust acts as insulation. A CPU heatsink caked in dust can lose 15-25%
        of its cooling capacity. GPU heatsink fins are even more susceptible
        because they&apos;re tightly packed. If you haven&apos;t cleaned your PC
        in 6+ months, dust is almost certainly contributing to higher
        temperatures.
      </p>

      <h3>5. High Ambient Room Temperature</h3>
      <p>
        Your cooler can only dissipate heat to the surrounding air. If your room
        is 30&deg;C (86&deg;F) in summer, your CPU temperatures will be
        10-15&deg;C higher than in a 20&deg;C (68&deg;F) room with the exact
        same cooling setup. This is physics — no hardware fix changes it.
      </p>

      <h2>How to Fix Thermal Throttling (Cheapest to Most Effective)</h2>

      <h3>Free: Clean Your PC</h3>
      <p>
        Before spending any money, clean your system. Use compressed air to blow
        out dust from your CPU cooler, GPU heatsink, case fans, and intake
        filters. This alone can drop temperatures by 5-15&deg;C. Do this every
        3-6 months as preventive maintenance.
      </p>

      <h3>Free: Optimize Your Fan Curve</h3>
      <p>
        Your motherboard&apos;s BIOS lets you adjust fan speeds based on
        temperature. Many default fan curves are conservative — they prioritize
        quiet operation over cooling. Set your fans to ramp up earlier and
        faster. A slightly louder PC that doesn&apos;t throttle beats a quiet
        one that stutters.
      </p>

      <h3>Free: Improve Cable Management and Airflow</h3>
      <p>
        Route cables behind the motherboard tray and out of the airflow path.
        Ensure your case has a front-to-back or bottom-to-top airflow pattern:
        intake fans in front/bottom pulling cool air in, exhaust fans in
        rear/top pushing hot air out. Even removing a solid side panel
        temporarily can confirm whether airflow is the issue.
      </p>

      <h3>$8-12: Replace Thermal Paste</h3>
      <p>
        If your PC is more than 2 years old, replacing the thermal paste
        between your CPU and cooler is one of the highest-value maintenance
        tasks. Quality options include:
      </p>
      <ul>
        <li>
          <A name="Noctua NT-H1 Thermal Paste" /> (~$9) — Easy to apply,
          non-conductive, excellent performance
        </li>
        <li>
          <A name="Thermal Grizzly Kryonaut Thermal Paste" /> (~$12) — Top-tier
          performance, the enthusiast standard
        </li>
      </ul>

      <h3>$25-50: Add Case Fans</h3>
      <p>
        If your case has empty fan slots, adding more fans dramatically improves
        airflow. The ideal setup is 2-3 intake fans and 1-2 exhaust fans
        (positive pressure keeps dust out). Our top picks:
      </p>
      <ul>
        <li>
          <A name="Arctic P12 PWM PST 120mm Fan 5-Pack" /> (~$30) — Best value
          fan pack, daisy-chain PWM connectors
        </li>
        <li>
          <A name="Noctua NF-A12x25 PWM 120mm Fan" /> (~$30 each) — The gold
          standard for silent, high-performance fans
        </li>
      </ul>

      <h3>$30-90: Upgrade Your CPU Cooler</h3>
      <p>
        If your current cooler simply can&apos;t keep up with your CPU&apos;s
        heat output, an upgrade makes the biggest single difference. Match the
        cooler to your CPU&apos;s TDP (Thermal Design Power):
      </p>

      <h4>Budget Air Coolers (65-125W TDP CPUs)</h4>
      <ul>
        <li>
          <A name="Thermalright Peerless Assassin 120 SE CPU Cooler" /> (~$35) —
          Best budget dual-tower cooler, handles mid-range CPUs with ease
        </li>
        <li>
          <A name="DeepCool AK400 CPU Cooler" /> (~$30) — Compact single-tower,
          great for smaller cases
        </li>
      </ul>

      <h4>Mid-Range Coolers (125-200W TDP CPUs)</h4>
      <ul>
        <li>
          <A name="Thermalright Phantom Spirit 120 EVO CPU Cooler" /> (~$45) —
          Excellent dual-tower that competes with coolers twice the price
        </li>
        <li>
          <A name="Noctua NH-D15 CPU Cooler" /> (~$90) — The legendary dual-tower
          air cooler, near-AIO performance with zero pump noise or failure risk
        </li>
      </ul>

      <h4>High-End AIO Liquid Coolers (200W+ TDP CPUs)</h4>
      <ul>
        <li>
          <A name="Arctic Liquid Freezer III 280mm AIO" /> (~$85) — Best value
          280mm AIO, excellent out-of-the-box thermal paste and offset mounting
        </li>
        <li>
          <A name="Arctic Liquid Freezer III 360mm AIO" /> (~$95) — The go-to for
          Intel i9 and AMD Ryzen 9 processors that push 250W+
        </li>
      </ul>

      <h2>CPU vs GPU Thermal Throttling: How to Tell the Difference</h2>
      <p>
        Both your CPU and GPU can throttle independently, and the fix is
        different for each:
      </p>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>CPU Throttling</th>
            <th>GPU Throttling</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Symptom</strong></td>
            <td>Overall system slowdown, affects all tasks</td>
            <td>Frame rate drops specifically in games/3D apps</td>
          </tr>
          <tr>
            <td><strong>Temperature</strong></td>
            <td>CPU Package above 95&deg;C</td>
            <td>GPU above 83-87&deg;C (NVIDIA) or junction above 100&deg;C (AMD)</td>
          </tr>
          <tr>
            <td><strong>Clock behavior</strong></td>
            <td>All-core clock drops below base frequency</td>
            <td>GPU boost clock drops 200-400 MHz from rated speed</td>
          </tr>
          <tr>
            <td><strong>Fix</strong></td>
            <td>Better CPU cooler, thermal paste, case airflow</td>
            <td>Custom fan curve, repaste GPU, improve case exhaust</td>
          </tr>
        </tbody>
      </table>

      <p>
        To determine which one is throttling, monitor both temperatures
        simultaneously using HWiNFO64 or our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          PC Bottleneck Analyzer
        </Link>{" "}
        during a 15-minute gaming session. The component hitting its thermal
        limit first is the one to fix first.
      </p>

      <h2>Laptop Thermal Throttling: A Special Case</h2>
      <p>
        Laptops are far more prone to thermal throttling than desktops because
        they pack powerful hardware into thin, poorly ventilated enclosures.
        Laptop-specific tips:
      </p>
      <ul>
        <li>
          <strong>Use a laptop cooling pad</strong> — Elevating the laptop and
          adding fan airflow underneath can drop temperatures by 5-10&deg;C. The{" "}
          <A name="IETS GT500 Powerful Laptop Cooling Pad" /> (~$50) is the most
          effective we&apos;ve tested.
        </li>
        <li>
          <strong>Clean the internal fans</strong> — Laptop fans clog with dust
          faster than desktops. Use compressed air through the exhaust vents
          every 3-6 months.
        </li>
        <li>
          <strong>Repaste the CPU and GPU</strong> — Laptop thermal paste dries
          out faster due to the higher sustained temperatures. This is more
          involved than desktop repasting (you need to disassemble the laptop),
          but the results are dramatic — often 10-20&deg;C improvement.
        </li>
        <li>
          <strong>Adjust power settings</strong> — Reduce the CPU&apos;s maximum
          turbo power in your laptop&apos;s control software (Armoury Crate for
          ASUS, Vantage for Lenovo, etc.). A small 10-15% power reduction often
          results in only 3-5% performance loss while cutting temperatures by
          15&deg;C+.
        </li>
      </ul>

      <h2>Preventing Thermal Throttling Long-Term</h2>
      <p>
        Once you&apos;ve fixed the immediate problem, these habits prevent it
        from coming back:
      </p>
      <ul>
        <li>
          <strong>Clean your PC every 3-6 months</strong> — Dust is the number
          one preventable cause of thermal issues
        </li>
        <li>
          <strong>Replace thermal paste every 2-3 years</strong> — Set a
          calendar reminder
        </li>
        <li>
          <strong>Monitor temperatures regularly</strong> — Run our{" "}
          <Link href="/dashboard" className="text-cyan underline">
            bottleneck analyzer
          </Link>{" "}
          periodically to catch temperature creep before it becomes throttling
        </li>
        <li>
          <strong>Size your cooler to your CPU</strong> — When upgrading your
          CPU, budget for a cooler that matches its TDP
        </li>
        <li>
          <strong>Maintain positive case pressure</strong> — More intake than
          exhaust fans keeps dust out and fresh air flowing in
        </li>
      </ul>

      <h2>Stop Guessing — Scan Your System</h2>
      <p>
        Thermal throttling is one of the most fixable bottlenecks, but only if
        you know it&apos;s happening. Our{" "}
        <Link href="/dashboard" className="text-cyan underline">
          free PC Bottleneck Analyzer
        </Link>{" "}
        checks your CPU and GPU temperatures, detects throttling patterns, and
        tells you exactly what to fix — alongside every other potential
        bottleneck in your system. One scan, full picture.
      </p>
      <p>No signup required. Free forever.</p>
    </>
  );
}
