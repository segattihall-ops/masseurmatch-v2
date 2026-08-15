import type { Metadata } from "next";
import { MotionProvider } from "@masseurmatch/ui";

// Design tokens first, then the app's Tailwind entrypoint, so utilities win.
import "@masseurmatch/ui/styles.css";
import "./globals.css";

import { satoshi } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "MasseurMatch — Premium Directory of Male Massage Therapists",
    template: "%s · MasseurMatch",
  },
  description:
    "Verified therapist discovery — a premium directory of male massage therapists you can trust.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={satoshi.variable}>
      <body className="min-h-screen overflow-x-hidden bg-background font-sans text-foreground antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
