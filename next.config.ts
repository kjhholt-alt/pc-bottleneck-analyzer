import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    root: process.cwd(),
  },
};

const withMDX = createMDX({
  options: {
    // remark-frontmatter strips the YAML `---` block so generated posts stop
    // rendering their frontmatter as raw text; remark-gfm enables GFM tables.
    // Both were missing -> every generated .mdx post showed raw frontmatter +
    // broken (raw-pipe) tables. String form keeps the config Turbopack-
    // serializable on Next 16.
    remarkPlugins: [["remark-frontmatter"], ["remark-gfm"]],
  },
});

export default withMDX(nextConfig);
