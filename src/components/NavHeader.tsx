import Link from "next/link";
import { Monitor, ArrowRight } from "lucide-react";

export function NavHeader() {
  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Monitor className="w-5 h-5 text-cyan" />
          <span className="font-semibold tracking-tight">
            PC Bottleneck Analyzer
          </span>
        </Link>
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
  );
}
