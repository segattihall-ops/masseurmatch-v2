import type { Metadata } from "next";
import { MotionProvider, PageTransition } from "@masseurmatch/ui";

// Design tokens first, then the app's Tailwind entrypoint, so utilities win.
import "@masseurmatch/ui/styles.css";
import "./globals.css";

import { SiteBottomBar } from "@/components/site-bottom-bar";
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
      {/*
        The bottom padding is what stops the mobile bar covering the last of the
        footer. It has to match the bar's own height (`min-h-14`) plus the safe
        area, and it is dropped from `sm` up where the bar is not rendered.
      */}
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-background pb-[calc(3.5rem+env(safe-area-inset-bottom))] font-sans text-foreground antialiased sm:pb-0">
        <MotionProvider>
          <SiteHeader />
          <PageTransition className="flex-1">{children}</PageTransition>
          <SiteFooter />
          <SiteBottomBar />
        </MotionProvider>
      </body>
    </html>
  );
}
