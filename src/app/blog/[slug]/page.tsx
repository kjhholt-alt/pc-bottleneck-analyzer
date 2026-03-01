import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { blogPosts, getPostBySlug } from "@/data/blog-posts";
import { NavHeader } from "@/components/NavHeader";
import { EmailCapture } from "@/components/EmailCapture";
import { GpuBottleneckingCpu } from "./posts/gpu-bottlenecking-cpu";
import { BestUpgrades2026 } from "./posts/best-upgrades-pc-bottlenecks-2026";
import { IBuiltAFreeBottleneckAnalyzer } from "./posts/i-built-a-free-pc-bottleneck-analyzer";

const POST_COMPONENTS: Record<string, React.ComponentType> = {
  "gpu-bottlenecking-cpu": GpuBottleneckingCpu,
  "best-upgrades-pc-bottlenecks-2026": BestUpgrades2026,
  "i-built-a-free-pc-bottleneck-analyzer": IBuiltAFreeBottleneckAnalyzer,
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://pcbottleneck.buildkit.store/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const Content = POST_COMPONENTS[slug];
  if (!Content) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "PC Bottleneck Analyzer" },
    mainEntityOfPage: `https://pcbottleneck.buildkit.store/blog/${slug}`,
  };

  return (
    <main className="min-h-screen">
      <NavHeader />

      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-cyan transition-colors mb-8"
        >
          <ArrowLeft size={12} />
          All posts
        </Link>

        {/* Post header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 text-xs text-text-secondary mb-4">
            <span>{post.publishedAt}</span>
            <span>&middot;</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-text-secondary">{post.description}</p>
        </div>

        {/* Post content */}
        <div className="prose-custom">
          <Content />
        </div>

        {/* CTA */}
        <div className="mt-12 bg-surface border border-cyan/30 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Find Your Bottleneck</h3>
          <p className="text-sm text-text-secondary mb-4">
            Run our free scanner and get AI-powered recommendations specific to
            your hardware.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan text-background font-semibold rounded-xl text-sm hover:bg-cyan/90 transition-colors"
          >
            Analyze My PC <ArrowRight size={14} />
          </Link>
        </div>

        {/* Email capture */}
        <div className="mt-8">
          <EmailCapture source="blog-post" />
        </div>
      </article>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-text-secondary">
          PC Bottleneck Analyzer &middot; Built with Next.js &middot; AI by
          Claude
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </main>
  );
}
