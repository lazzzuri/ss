import "@fontsource/onest/cyrillic-400.css";
import "@fontsource/onest/latin-400.css";
import "@fontsource/onest/cyrillic-500.css";
import "@fontsource/onest/latin-500.css";
import "@fontsource/onest/cyrillic-600.css";
import "@fontsource/onest/latin-600.css";
import "@fontsource/unbounded/cyrillic-600.css";
import "@fontsource/unbounded/latin-600.css";
import "@fontsource/unbounded/cyrillic-700.css";
import "@fontsource/unbounded/latin-700.css";
import "@fontsource/ibm-plex-mono/cyrillic-400.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/cyrillic-500.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "../../globals.css";

import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Footer, Header, Sky } from "@/components/chrome";
import { getSettings } from "@/lib/settings";
import { isLang } from "@/i18n/routes";
import { siteUrl } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "uk" }, { lang: "ru" }];
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a1b2e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const settings = await getSettings();
  return (
    <html lang={lang}>
      <body>
        <Sky />
        <Header lang={lang} settings={settings} />
        <main id="main">{children}</main>
        <Footer lang={lang} settings={settings} />
      </body>
    </html>
  );
}
