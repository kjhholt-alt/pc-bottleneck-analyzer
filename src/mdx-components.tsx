import type { MDXComponents } from "mdx/types";
import { getAmazonLink } from "@/lib/affiliate";
import Link from "next/link";

function AffiliateLink({ name }: { name: string }) {
  return (
    <a
      href={getAmazonLink(name)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="text-cyan hover:underline"
    >
      {name}
    </a>
  );
}

/**
 * FTC-required affiliate disclosure. Rendered near the top of any post that
 * carries affiliate links (e.g. the generated tier lists).
 */
function AffiliateDisclosure() {
  return (
    <aside
      role="note"
      className="not-prose my-6 rounded-xl border border-border bg-surface/60 px-4 py-3 text-xs text-text-secondary"
    >
      <strong className="text-text-primary">Disclosure:</strong> some links on
      this page are affiliate links. If you buy through them we may earn a small
      commission at no extra cost to you. Our rankings are generated from
      hardware-benchmark data — commissions never affect placement.
    </aside>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    AffiliateLink,
    AffiliateDisclosure,
    a: ({
      href,
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      href?.startsWith("/") ? (
        <Link href={href} {...props}>
          {children}
        </Link>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      ),
  };
}
