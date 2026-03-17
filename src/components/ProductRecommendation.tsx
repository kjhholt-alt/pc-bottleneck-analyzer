"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ExternalLink, TrendingUp } from "lucide-react";
import type { Bottleneck } from "@/lib/types";
import { getAmazonLink } from "@/lib/affiliate";
import { trackAffiliateClick } from "@/lib/track";

export interface ProductSuggestion {
  name: string;
  category: "CPU" | "GPU" | "RAM" | "SSD" | "Cooling";
  priceRange: string;
  reason: string;
  searchTerm: string; // What to search on Amazon
}

interface ProductRecommendationProps {
  bottlenecks: Bottleneck[];
}

// Map bottleneck categories to product recommendations
function getProductSuggestions(bottlenecks: Bottleneck[]): ProductSuggestion[] {
  const suggestions: ProductSuggestion[] = [];
  const seen = new Set<string>();

  for (const bottleneck of bottlenecks) {
    // Only show critical and warning bottlenecks
    if (bottleneck.severity !== "critical" && bottleneck.severity !== "warning") {
      continue;
    }

    let product: ProductSuggestion | null = null;

    // CPU bottlenecks
    if (bottleneck.category === "cpu" && !seen.has("cpu")) {
      if (bottleneck.id.includes("upgrade") || bottleneck.severity === "critical") {
        product = {
          name: "High-Performance Gaming CPU",
          category: "CPU",
          priceRange: "$200 - $500",
          reason: "Eliminate CPU bottleneck and boost frame rates",
          searchTerm: "AMD Ryzen 7 9800X3D",
        };
      } else {
        product = {
          name: "CPU Cooler Upgrade",
          category: "Cooling",
          priceRange: "$30 - $120",
          reason: "Better cooling reduces thermal throttling",
          searchTerm: "CPU Cooler Tower",
        };
      }
      seen.add("cpu");
    }

    // GPU bottlenecks
    if (bottleneck.category === "gpu" && !seen.has("gpu")) {
      if (bottleneck.id.includes("upgrade") || bottleneck.severity === "critical") {
        product = {
          name: "Modern Gaming Graphics Card",
          category: "GPU",
          priceRange: "$300 - $800",
          reason: "Unlock higher frame rates and better graphics quality",
          searchTerm: "NVIDIA RTX 4070 Graphics Card",
        };
      } else if (bottleneck.id.includes("driver")) {
        // Driver issues - no product needed
        continue;
      } else {
        product = {
          name: "GPU Cooling Solution",
          category: "Cooling",
          priceRange: "$20 - $80",
          reason: "Keep your GPU running cool and fast",
          searchTerm: "GPU Cooling Fan",
        };
      }
      seen.add("gpu");
    }

    // RAM bottlenecks
    if (bottleneck.category === "ram" && !seen.has("ram")) {
      if (bottleneck.id.includes("single-channel") || bottleneck.id.includes("dual-channel")) {
        product = {
          name: "Dual Channel RAM Kit",
          category: "RAM",
          priceRange: "$50 - $150",
          reason: "Double your memory bandwidth instantly",
          searchTerm: "DDR4 32GB Dual Channel RAM Kit 3200MHz",
        };
      } else if (bottleneck.id.includes("capacity")) {
        product = {
          name: "High Capacity RAM Upgrade",
          category: "RAM",
          priceRange: "$60 - $200",
          reason: "More RAM means smoother multitasking and gaming",
          searchTerm: "DDR4 64GB RAM Kit",
        };
      } else {
        product = {
          name: "Fast DDR4 RAM Kit",
          category: "RAM",
          priceRange: "$50 - $150",
          reason: "Enable XMP speeds for instant performance boost",
          searchTerm: "DDR4 32GB 3600MHz CL16 RAM Kit",
        };
      }
      seen.add("ram");
    }

    // Storage bottlenecks
    if (bottleneck.category === "storage" && !seen.has("storage")) {
      if (bottleneck.id.includes("boot") || bottleneck.id.includes("nvme")) {
        product = {
          name: "NVMe M.2 SSD",
          category: "SSD",
          priceRange: "$80 - $200",
          reason: "5x faster boot times and game loading",
          searchTerm: "1TB NVMe M.2 PCIe 4.0 SSD",
        };
      } else {
        product = {
          name: "SATA SSD Upgrade",
          category: "SSD",
          priceRange: "$50 - $120",
          reason: "Faster than HDD, affordable upgrade",
          searchTerm: "1TB SATA SSD",
        };
      }
      seen.add("storage");
    }

    // Thermal bottlenecks
    if (bottleneck.category === "thermal" && !seen.has("thermal")) {
      product = {
        name: "High-Performance CPU Cooler",
        category: "Cooling",
        priceRange: "$40 - $150",
        reason: "Stop thermal throttling, unlock full performance",
        searchTerm: "Tower CPU Cooler 240mm AIO",
      };
      seen.add("thermal");
    }

    if (product) {
      suggestions.push(product);
    }
  }

  return suggestions;
}

function ProductCard({ product }: { product: ProductSuggestion }) {
  const amazonUrl = getAmazonLink(product.searchTerm);

  const categoryColors = {
    CPU: { bg: "bg-purple-dim", border: "border-purple/30", text: "text-purple" },
    GPU: { bg: "bg-cyan-dim", border: "border-cyan/30", text: "text-cyan" },
    RAM: { bg: "bg-green-dim", border: "border-green/30", text: "text-green" },
    SSD: { bg: "bg-amber-dim", border: "border-amber/30", text: "text-amber" },
    Cooling: { bg: "bg-red-dim", border: "border-red/30", text: "text-red" },
  };

  const colors = categoryColors[product.category];

  return (
    <motion.div
      className="bg-surface border border-border rounded-2xl p-5 hover:border-cyan/30 transition-all duration-200 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-mono px-2.5 py-1 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}
        >
          {product.category}
        </span>
        <TrendingUp size={16} className="text-text-secondary/60" />
      </div>

      {/* Product name */}
      <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-cyan transition-colors">
        {product.name}
      </h3>

      {/* Reason */}
      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        {product.reason}
      </p>

      {/* Price + CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <span className="text-sm font-mono text-text-secondary">
          {product.priceRange}
        </span>
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackAffiliateClick("amazon", product.searchTerm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan/10 border border-cyan/20 rounded-lg
                     text-cyan text-sm font-medium hover:bg-cyan hover:text-background transition-all duration-200"
        >
          <ShoppingCart size={14} />
          Buy on Amazon
          <ExternalLink size={12} className="opacity-60" />
        </a>
      </div>
    </motion.div>
  );
}

export function ProductRecommendation({ bottlenecks }: ProductRecommendationProps) {
  const suggestions = getProductSuggestions(bottlenecks);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShoppingCart size={20} className="text-cyan" />
            Recommended Upgrades
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Based on your bottlenecks — click to shop on Amazon
          </p>
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((product, i) => (
          <ProductCard key={`${product.category}-${i}`} product={product} />
        ))}
      </div>

      {/* Affiliate disclosure */}
      <motion.div
        className="mt-6 px-4 py-3 bg-surface-raised/50 border border-border/50 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-foreground">Affiliate Disclosure:</strong> We earn a small
          commission from qualifying purchases made through Amazon links at no extra cost to you.
          This helps us keep the analyzer free and continuously improve it. Prices and availability
          are subject to change.
        </p>
      </motion.div>
    </div>
  );
}
