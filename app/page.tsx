"use client";

import Navbar from "@/components/Landing/Navbar";
import Hero from "@/components/Landing/Hero";
import Features from "@/components/Landing/Features";
import CallToAction from "@/components/Landing/CallToAction";
import Footer from "@/components/Landing/Footer";

export default function LandingPage() {
  return (
    <main className="main-background">
      <Navbar />
      <Hero />
      <Features />
      <CallToAction />
      <Footer />
    </main>
  );
}
