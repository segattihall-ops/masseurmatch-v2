import type { Metadata } from "next";
import { MotionProvider, PageTransition } from "@masseurmatch/ui";

// Design tokens first, then the app's Tailwind entrypoint, so utilities win.
import "@masseurmatch/ui/styles.css";
import "./globals.css";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { satoshi } from "./fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Premium Directory of Male Massage Therapists`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={satoshi.variable}>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-background font-sans text-foreground antialiased">
        <MotionProvider>
          <SiteHeader />
          <PageTransition className="flex-1">{children}</PageTransition>
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}
