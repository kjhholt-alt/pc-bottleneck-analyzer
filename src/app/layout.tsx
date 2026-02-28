import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TrackingProvider } from "@/components/TrackingProvider";
import { LemonSqueezyProvider } from "@/components/LemonSqueezyProvider";
import { faqs } from "@/data/faq";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PC Bottleneck Analyzer - Free AI-Powered Hardware Analysis",
    template: "%s | PC Bottleneck Analyzer",
  },
  description:
    "Scan your PC hardware, detect bottlenecks, and get AI-powered recommendations to maximize performance. Free during beta.",
  metadataBase: new URL("https://pcbottleneck.buildkit.store"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pcbottleneck.buildkit.store",
    siteName: "PC Bottleneck Analyzer",
    title: "PC Bottleneck Analyzer - Free AI-Powered Hardware Analysis",
    description:
      "Scan your PC, detect bottlenecks, and get AI recommendations specific to your hardware. Free during beta.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PC Bottleneck Analyzer",
    description:
      "Free AI-powered PC hardware analysis. Detect bottlenecks, get upgrade recommendations.",
  },
  alternates: {
    canonical: "https://pcbottleneck.buildkit.store",
  },
};

function JsonLd() {
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PC Bottleneck Analyzer",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Windows 10, Windows 11",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Scan your PC hardware, detect bottlenecks, and get AI-powered recommendations to maximize performance.",
    url: "https://pcbottleneck.buildkit.store",
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <TrackingProvider />
        <LemonSqueezyProvider />
        <Analytics />
        <JsonLd />
      </body>
    </html>
  );
}
