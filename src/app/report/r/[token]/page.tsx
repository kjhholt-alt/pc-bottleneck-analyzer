import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Printer, AlertTriangle } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { ReportFrame } from "@/components/ReportFrame";
import { DeepDivePending } from "@/components/DeepDivePending";
import { getReportStore, isValidToken } from "@/lib/deepdive/store";

// Private, per-buyer, live data — never prerender, never index.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your PC Deep-Dive Report",
  robots: { index: false, follow: false },
};

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isValidToken(token)) notFound();

  const order = await getReportStore().get(token);
  if (!order) notFound();

  return (
    <main className="min-h-screen">
      <NavHeader />
      <section className="max-w-4xl mx-auto px-6 py-12">
        {order.status === "fulfilled" && order.html ? (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Your report is ready</h1>
                <p className="text-text-secondary text-sm mt-1">
                  Private to you — this link is unguessable and not indexed. Bookmark it.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/report/r/${token}/download`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm hover:border-cyan/50 transition-colors"
                >
                  <Download size={14} /> Download
                </a>
                <a
                  href={`/report/r/${token}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors"
                >
                  <Printer size={14} /> Print / Save as PDF
                </a>
              </div>
            </div>
            <ReportFrame html={order.html} />
          </>
        ) : order.status === "failed" ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center">
            <AlertTriangle size={28} className="text-amber-400 mx-auto mb-4" />
            <h1 className="text-lg font-semibold mb-2">Something went wrong generating your report</h1>
            <p className="text-sm text-text-secondary max-w-md mx-auto mb-4">
              Your purchase is safe. We&apos;ve logged the issue and it will be regenerated — check
              back shortly, or reach out with your order number.
            </p>
            <Link href="/report" className="text-cyan text-sm hover:underline">
              Back to reports
            </Link>
          </div>
        ) : (
          <DeepDivePending token={token} />
        )}
      </section>
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js
        </div>
      </footer>
    </main>
  );
}
