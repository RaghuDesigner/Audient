import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Suspense } from "react";

import { SystemStatusBannerShell } from "@/components/system/SystemStatusBannerShell";
import { Toaster } from "@/components/ui/toast";
import { AuthProvider } from "@/providers/auth-provider";
import { AccountProvider } from "@/providers/account-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

const fontSans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Audient — AI-Powered UX Audits",
    template: "%s · Audient",
  },
  description:
    "Audient delivers expert-level, AI-powered UX audits for your website in minutes.",
};

/** Enables safe-area env() on notched devices. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider defaultTheme="light" darkPaletteReady={false}>
          <AuthProvider>
            <AccountProvider>
              <Suspense fallback={null}>
                <SystemStatusBannerShell />
              </Suspense>
              {children}
              <Toaster />
            </AccountProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
