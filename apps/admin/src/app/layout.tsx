import type { Metadata } from "next";

import { MotionProvider } from "@masseurmatch/ui";
import "@masseurmatch/ui/styles.css";

import "./globals.css";
import { satoshi } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "MasseurMatch Admin",
    template: "%s · MasseurMatch Admin",
  },
  description: "Administrative operations for MasseurMatch.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={satoshi.variable}>
      <body className="min-h-screen bg-bg-subtle font-sans text-foreground antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
