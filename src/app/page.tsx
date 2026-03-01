"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Monitor,
  Download,
  Upload,
  Sparkles,
  Gauge,
  AlertTriangle,
  Sliders,
  Settings,
  History,
  ChevronDown,
  ArrowRight,
  Check,
  Shield,
  Wifi,
  HardDrive,
  Brain,
} from "lucide-react";
import { EmailCapture } from "@/components/EmailCapture";
// Pro gates disabled during beta — all features free

// ── Fade-in animation wrapper ──
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── FAQ Accordion ──
import { faqs as faqData } from "@/data/faq";

const iconMap = { Shield, Wifi, HardDrive, Brain } as const;
const faqs = faqData.map((faq) => ({
  ...faq,
  icon: iconMap[faq.iconName],
}));

function FAQItem({
  q,
  a,
  icon: Icon,
}: {
  q: string;
  a: string;
  icon: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-raised/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-cyan-dim border border-cyan/20 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-cyan" />
        </div>
        <span className="flex-1 text-sm font-medium text-foreground">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-text-secondary" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-text-secondary leading-relaxed pl-16">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Landing Page ──
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* ── Nav ── */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-cyan" />
            <span className="font-semibold tracking-tight">
              PC Bottleneck Analyzer
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/blog"
              className="text-xs font-mono text-text-secondary hover:text-cyan transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-mono text-text-secondary hover:text-cyan transition-colors flex items-center gap-1.5"
            >
              Open Dashboard
              <ArrowRight size={12} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-mono text-cyan uppercase tracking-widest mb-4">
            Free scan &middot; AI-powered analysis
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Find Out Exactly What&apos;s{" "}
            <span className="text-cyan">Bottlenecking</span> Your PC
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto mb-10">
            Run a 60-second scan, upload the results, and get a performance
            score with AI-powered recommendations tailored to your exact
            hardware.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-7 py-3.5 bg-cyan text-background font-semibold
                         rounded-xl hover:bg-cyan/90 transition-colors text-sm"
            >
              Analyze My PC
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://github.com/kjhholt-alt/pc-bottleneck-analyzer/releases/download/scanner-latest/PC-Scanner.exe"
              className="flex items-center gap-2 px-6 py-3.5 border border-border text-text-secondary
                         rounded-xl hover:border-cyan/40 hover:text-foreground transition-colors text-sm"
            >
              <Download size={16} />
              Download Scanner (.exe)
            </a>
          </div>
        </FadeIn>

        {/* Score preview */}
        <FadeIn delay={0.2} className="mt-16 flex justify-center">
          <div className="relative">
            <div className="w-48 h-48 rounded-full border-[6px] border-cyan/20 flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl font-bold font-mono text-cyan">
                  72
                </span>
                <span className="block text-sm text-text-secondary mt-1">
                  / 100
                </span>
                <span className="block text-xs font-mono text-amber mt-1">
                  Grade B
                </span>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 px-2.5 py-1 bg-red-dim border border-red/30 rounded-full">
              <span className="text-[10px] font-mono text-red">
                3 issues found
              </span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="border-t border-border bg-surface/50"
      >
        <div className="max-w-6xl mx-auto px-6 py-20">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-mono text-cyan uppercase tracking-widest mb-3">
              3 simple steps
            </p>
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                icon: Download,
                title: "Download the Scanner",
                desc: "A lightweight .exe — no install needed. Right-click, Run as Administrator. Takes about 10 seconds.",
                href: "https://github.com/kjhholt-alt/pc-bottleneck-analyzer/releases/download/scanner-latest/PC-Scanner.exe",
              },
              {
                step: "2",
                icon: Upload,
                title: "Upload Your Results",
                desc: "The scanner saves a JSON file to your Desktop. Drag and drop it into our dashboard.",
              },
              {
                step: "3",
                icon: Sparkles,
                title: "Get Your Analysis",
                desc: "Instant performance score, bottleneck detection, and AI-powered recommendations specific to your hardware.",
              },
            ].map((item, i) => {
              const content = (
                <div className="bg-surface border border-border rounded-2xl p-6 h-full hover:border-cyan/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-cyan-dim border border-cyan/30 flex items-center justify-center">
                      <item.icon size={18} className="text-cyan" />
                    </div>
                    <span className="text-xs font-mono text-text-secondary">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
              return (
                <FadeIn key={item.step} delay={i * 0.1}>
                  {"href" in item && item.href ? (
                    <a href={item.href} className="block">{content}</a>
                  ) : (
                    content
                  )}
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-mono text-cyan uppercase tracking-widest mb-3">
              Everything you need
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              More Than Just a Score
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Gauge,
                title: "Performance Score",
                desc: "0-100 score with letter grade and per-component breakdown (CPU, GPU, RAM, Storage, Settings).",
              },
              {
                icon: AlertTriangle,
                title: "Bottleneck Detection",
                desc: "Pinpoints exactly what's holding you back — CPU/GPU mismatch, slow RAM, thermal throttling, bad BIOS settings.",
              },
              {
                icon: Sparkles,
                title: "AI Deep Analysis",
                desc: "Claude AI explains your bottlenecks in plain English, estimates real FPS impact, and suggests specific fixes.",
              },
              {
                icon: Sliders,
                title: "Upgrade Simulator",
                desc: "\"What if I upgraded to an RTX 4070?\" — see the score change before you spend money.",
              },
              {
                icon: Settings,
                title: "BIOS Optimization",
                desc: "Per-motherboard guides to enable XMP, Resizable BAR, and other free performance boosts.",
              },
              {
                icon: History,
                title: "Scan History",
                desc: "Track changes over time. Compare before/after to prove your upgrades worked.",
              },
            ].map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.06}>
                <div className="bg-surface border border-border rounded-2xl p-5 h-full hover:border-cyan/30 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-cyan-dim border border-cyan/20 flex items-center justify-center mb-4">
                    <feature.icon size={18} className="text-cyan" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Preview ── */}
      <section className="border-t border-border bg-surface/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <FadeIn className="text-center mb-12">
            <p className="text-xs font-mono text-cyan uppercase tracking-widest mb-3">
              AI-powered insights
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              See What the AI Finds
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-cyan" />
                <span className="text-sm font-semibold text-foreground">
                  AI Deep Analysis
                </span>
                <span className="ml-auto text-[10px] font-mono text-text-secondary bg-surface-raised px-2 py-0.5 rounded-full border border-border">
                  Sample output
                </span>
              </div>

              <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                <h3 className="text-sm font-semibold text-foreground">
                  Quick Verdict
                </h3>
                <p>
                  Your RTX 4070 Ti is being held back by RAM running at JEDEC
                  defaults instead of XMP speeds — you&apos;re leaving{" "}
                  <strong className="text-foreground">
                    15-25% performance on the table for free
                  </strong>
                  .
                </p>

                <h3 className="text-sm font-semibold text-foreground mt-4">
                  Top Bottleneck
                </h3>
                <div className="flex items-start gap-2">
                  <span className="text-red mt-0.5 shrink-0">1.</span>
                  <p>
                    <strong className="text-foreground">
                      RAM at 2133 MHz (XMP Disabled)
                    </strong>{" "}
                    — Your Ryzen 5800X scales directly with memory speed. At
                    2133 MHz you&apos;re losing ~20 FPS in Cyberpunk and ~15 FPS
                    in Valorant. Fix:{" "}
                    <code className="px-1.5 py-0.5 bg-surface-raised border border-border rounded text-cyan text-xs font-mono">
                      BIOS → Advanced → XMP Profile 1
                    </code>
                  </p>
                </div>

                <h3 className="text-sm font-semibold text-foreground mt-4">
                  Free Fix
                </h3>
                <p>
                  Enable XMP + switch Windows power plan to High Performance.
                  Estimated gain:{" "}
                  <strong className="text-green">+20-30 FPS</strong> in most
                  games with zero cost.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-mono text-cyan uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              100% Free During Beta
            </h2>
            <p className="text-text-secondary mt-3 max-w-lg mx-auto">
              Every feature is unlocked — no paywalls, no sign-up required. Just scan and go.
            </p>
          </FadeIn>

          <div className="max-w-md mx-auto">
            <FadeIn>
              <div className="bg-surface border-2 border-cyan/40 rounded-2xl p-6 flex flex-col relative">
                <div className="absolute -top-3 left-6 px-3 py-0.5 bg-cyan text-background text-xs font-semibold rounded-full">
                  Beta
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  All Features Included
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  The full picture + expert AI guidance
                </p>
                <div className="mb-6">
                  <span className="text-3xl font-bold font-mono text-cyan">
                    $0
                  </span>
                  <span className="text-sm text-text-secondary ml-2">
                    free during beta
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Performance score (0-100)",
                    "Bottleneck detection",
                    "All recommendations unlocked",
                    "AI deep analysis (Claude-powered)",
                    "Follow-up chat with AI",
                    "Per-motherboard BIOS guide",
                    "Upgrade simulator",
                    "Game FPS estimator",
                    "Real-time monitor",
                    "Goal upgrade planner",
                    "PDF report export",
                    "Scan history & comparison",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-text-secondary"
                    >
                      <Check
                        size={14}
                        className="text-cyan mt-0.5 shrink-0"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className="block text-center py-3 bg-cyan text-background rounded-xl text-sm font-semibold
                             hover:bg-cyan/90 transition-colors"
                >
                  Get Started Free
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-border bg-surface/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-mono text-cyan uppercase tracking-widest mb-3">
              Questions
            </p>
            <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
          </FadeIn>

          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={faq.q} delay={i * 0.06}>
                <FAQItem {...faq} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Email Capture ── */}
      <section className="border-t border-border">
        <div className="max-w-xl mx-auto px-6 py-16">
          <FadeIn>
            <EmailCapture source="landing-page" />
          </FadeIn>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to Optimize?
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Find out what&apos;s holding your PC back. Free scan, instant
              results, no signup required.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-cyan text-background font-semibold
                         rounded-xl hover:bg-cyan/90 transition-colors text-sm"
            >
              Analyze My PC
              <ArrowRight size={16} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <Monitor size={14} className="text-cyan" />
            <span>PC Bottleneck Analyzer</span>
          </div>
          <p className="text-xs text-text-secondary">
            Built with Next.js &middot; AI by Claude &middot; Open source
            scanner
          </p>
        </div>
      </footer>
    </main>
  );
}
