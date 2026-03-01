import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost } from "@/data/blog-posts";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export function getMdxPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data } = matter(raw);
    const slug = file.replace(/\.mdx$/, "");

    return {
      slug,
      title: data.title || slug,
      description: data.description || "",
      publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
      updatedAt: data.updatedAt,
      author: data.author || "PC Bottleneck Analyzer Team",
      tags: data.tags || [],
      readingTime: data.readingTime || "5 min read",
    };
  });
}

export function getMdxPostBySlug(
  slug: string
): { frontmatter: BlogPost; content: string } | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

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
}
