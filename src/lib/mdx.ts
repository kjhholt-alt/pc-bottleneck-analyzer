import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost } from "@/data/blog-posts";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

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
