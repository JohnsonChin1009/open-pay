"use client";
import { Navbar } from "@/components/ui/navbar"
import { RightSidebar } from "@/components/ui/right-sidebar"
import { HeroSection } from "@/components/ui/hero-section"
import { AboutSection } from "@/components/ui/about-section"
import { Footer } from "@/components/ui/footer"


export default function LandingPage() {
  return (
    <main>
      <div className="min-h-screen bg-[#f5f3f0]">
        <Navbar />
        <RightSidebar />
        <main>
          <HeroSection />
          <AboutSection />
        </main>
        <Footer />
      </div>
    </main>
  );
}