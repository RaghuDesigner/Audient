"use client";

import { Header } from "@/components/home/header";
import { HeroSection } from "@/components/home/hero-section";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";

/**
 * SCREEN-001 — Guest Home / Landing (Figma Screen1).
 * Marketing product entry: header + hero audit controls.
 * Login Modal is mounted by `LoginModalProvider` — not embedded here.
 */
export function HomeScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink targetId="main" label="Skip to main content" />
      <Header />
      <main
        id="main"
        className="flex flex-1 flex-col items-center justify-center"
      >
        <HeroSection />
      </main>
      <Footer variant="minimal" />
    </div>
  );
}
