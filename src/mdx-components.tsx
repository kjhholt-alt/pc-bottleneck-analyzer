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

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    AffiliateLink,
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
