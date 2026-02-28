import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/data/blog-posts";
import { NavHeader } from "@/components/NavHeader";
import { EmailCapture } from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "PC hardware guides, bottleneck fixes, and upgrade recommendations to get the most out of your system.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <NavHeader />

      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
        <p className="text-text-secondary mb-12">
          Guides, tips, and hardware recommendations to get the most out of your
          PC.
        </p>

        <div className="space-y-6 mb-16">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="bg-surface border border-border rounded-2xl p-6 hover:border-cyan/30 transition-colors">
                <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {post.publishedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readingTime}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  {post.description}
                </p>
                <span className="text-cyan text-sm flex items-center gap-1">
                  Read more <ArrowRight size={14} />
                </span>
              </article>
            </Link>
          ))}
        </div>

        <EmailCapture source="blog-listing" />
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js &middot; AI by
          Claude
        </div>
      </footer>
    </main>
  );
}
