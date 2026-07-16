import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost } from "@/data/blog-posts";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Flatten a snippet of MDX prose to clean plain text for a FAQPage answer.
 * `acceptedAnswer.text` should read as prose, so strip <AffiliateLink> and any
 * other JSX tags (keeping the product name / inner text), markdown links,
 * images, emphasis, and inline code, then collapse whitespace.
 */
function cleanFaqText(md: string): string {
  return md
    // <AffiliateLink name="AMD Ryzen 7 9800X3D" /> -> the product name
    .replace(
      /<AffiliateLink\b[^>]*\bname=["']([^"']+)["'][^>]*\/?>/g,
      "$1"
    )
    // any remaining self-closing / paired JSX tags -> drop tag, keep inner text
    .replace(/<\/?[A-Za-z][^>]*>/g, "")
    // images ![alt](url) -> alt  (before the link rule, which is a subset)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // bold / italic / inline code markers
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse a post body into FAQ Q&A pairs. Convention across the content lane:
 *   `## FAQ` / `## Frequently Asked Questions` (H2, optional trailing text)
 *   opens the section; the answer is the prose until the next question, and
 *   the section ends at the next H2.
 * A question is either an `### ...` (H3) or a standalone all-bold line ending
 * in `?` (`**Is X better than Y?**`) — the content lane uses both. The `?` is
 * required on the bold form so a bold lead-in inside an answer isn't read as a
 * question. Returns [] when there is no parseable FAQ section.
 */
export function parseFaqsFromContent(content: string): FaqItem[] {
  const lines = content.split(/\r?\n/);

  // Locate the FAQ section header (H2 whose text begins FAQ / Frequently Asked).
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+(FAQ|Frequently Asked)/i.test(lines[i])) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return [];

  const faqs: FaqItem[] = [];
  let question: string | null = null;
  let answerLines: string[] = [];

  const flush = () => {
    if (question) {
      const answer = cleanFaqText(answerLines.join(" "));
      const q = cleanFaqText(question);
      if (q && answer) faqs.push({ question: q, answer });
    }
    question = null;
    answerLines = [];
  };

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    // A new H2 (exactly `## `, not `###`) ends the FAQ section.
    if (/^##\s+/.test(line)) {
      flush();
      break;
    }
    const h3 = line.match(/^###\s+(.+?)\s*$/);
    const boldQ = line.match(/^\*\*(.+\?)\*\*\s*$/);
    if (h3 || boldQ) {
      flush();
      question = (h3 ?? boldQ)![1];
    } else if (question && !/^-{3,}\s*$/.test(line)) {
      answerLines.push(line);
    }
  }
  flush();

  return faqs;
}

/**
 * Read a post's MDX source and extract its FAQ Q&A pairs (see
 * {@link parseFaqsFromContent}). Used by the blog page to emit FAQPage
 * structured data — AI answer engines and Google rich results preferentially
 * cite pages whose Q&A is machine-readable, and the copy already exists.
 * Safe for slugs with no `.mdx` file (e.g. component posts): returns [].
 */
export function getFaqsFromMdx(slug: string): FaqItem[] {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return parseFaqsFromContent(matter(raw).content);
  } catch {
    return [];
  }
}

export function getMdxPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  const posts: BlogPost[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data } = matter(raw);
      const slug = file.replace(/\.mdx$/, "");

      posts.push({
        slug,
        title: data.title || slug,
        description: data.description || "",
        publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
        updatedAt: data.updatedAt,
        author: data.author || "PC Bottleneck Analyzer Team",
        tags: data.tags || [],
        readingTime: data.readingTime || "5 min read",
      });
    } catch (err) {
      // A single malformed post must never crash the whole build.
      // Skip it (it won't render) and keep the rest of the blog shippable.
      console.error(
        `[mdx] skipping ${file}: failed to parse frontmatter — ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
  return posts;
}

export function getMdxPostBySlug(
  slug: string
): { frontmatter: BlogPost; content: string } | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
      frontmatter: {
        slug,
        title: data.title || slug,
        description: data.description || "",
        publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
        updatedAt: data.updatedAt,
        author: data.author || "PC Bottleneck Analyzer Team",
        tags: data.tags || [],
        readingTime: data.readingTime || "5 min read",
      },
      content,
    };
  } catch (err) {
    // A malformed post should 404, not crash the build.
    console.error(
      `[mdx] failed to parse ${slug}.mdx — ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    return null;
  }
}
