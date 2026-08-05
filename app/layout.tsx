import type { Metadata } from "next";
import AnalyticsEvents from "./AnalyticsEvents";
import "./globals.css";
import "./team-logos.css";
import "./ranking-fix.css";
import "./leaderboard.css";
import "./header-fix.css";
import "./mobile-team-role-fix.css";
import "./titles.css";
import "./distribution.css";

const siteUrl = "https://www.ti2026calculator.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Dota 2 TI2026 Fantasy Calculator & Optimizer",
  description:
    "Free Dota 2 TI2026 Fantasy Calculator & Optimizer for comparing Core, Mid and Support banners using historical Tier 1 tournament statistics.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "TI2026 Fantasy Calculator & Optimizer",
    title: "Dota 2 TI2026 Fantasy Calculator & Optimizer",
    description:
      "Compare Fantasy banners, player combinations and projected TI2026 roster scores."
  },
  twitter: {
    card: "summary_large_image",
    title: "Dota 2 TI2026 Fantasy Calculator & Optimizer",
    description:
      "Compare Fantasy banners, player combinations and projected TI2026 roster scores."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <AnalyticsEvents />
      </body>
    </html>
  );
}
