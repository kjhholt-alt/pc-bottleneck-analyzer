export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  readingTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "gpu-bottlenecking-cpu",
    title: "Is Your GPU Bottlenecking Your CPU? Here's How to Tell",
    description:
      "Learn how to identify if your GPU is bottlenecking your CPU, the warning signs to look for, and the best upgrades to fix the imbalance.",
    publishedAt: "2026-02-27",
    author: "PC Bottleneck Analyzer Team",
    tags: ["bottleneck", "GPU", "CPU", "diagnosis"],
    readingTime: "8 min read",
  },
  {
    slug: "best-upgrades-pc-bottlenecks-2026",
    title: "Best Upgrades for Common PC Bottlenecks in 2026",
    description:
      "The definitive guide to the best CPU, GPU, RAM, and SSD upgrades to fix common PC bottlenecks in 2026, with price-to-performance picks at every budget.",
    publishedAt: "2026-02-27",
    author: "PC Bottleneck Analyzer Team",
    tags: ["upgrades", "buying guide", "2026", "hardware"],
    readingTime: "10 min read",
  },
  {
    slug: "i-built-a-free-pc-bottleneck-analyzer",
    title: "I Built a Free PC Bottleneck Analyzer — Here's What I Learned",
    description:
      "How I built a tool that scans your PC hardware, scores your system out of 100, and tells you exactly what to upgrade — and the surprising patterns I found after analyzing hundreds of systems.",
    publishedAt: "2026-02-28",
    author: "Kruz Holt",
    tags: ["maker", "behind the scenes", "bottleneck", "PC building"],
    readingTime: "7 min read",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
