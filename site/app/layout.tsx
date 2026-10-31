import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono } from "next/font/google";

import "./global.css";
import { SITE } from "@/lib/site";

// Archivo's width axis carries the display type (font-stretch: 125%).
const sans = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name,
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: SITE.name, title: SITE.name, description: SITE.description },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
};

export const viewport: Viewport = { themeColor: "#0d0c0b", colorScheme: "dark" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The class set before paint marks that scripts run, so content that
    // animates in is only hidden when something will reveal it.
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
