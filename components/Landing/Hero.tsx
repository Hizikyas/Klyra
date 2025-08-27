"use client";

import { Play, Code, User, DollarSign, Newspaper, Mail, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid Background - Only in Hero */}
      <div className="grid-background" />

      {/* Radial gradient for faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 gradient-animation opacity-30" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
          Empowering
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Ethiopia&apos;s Digital
          </span>
          <br />
          Future
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed">
          We are a leading technology company delivering innovative digital solutions, software development, and IT
          consulting services that drive growth and transformation across Ethiopia and beyond.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button className="btn-primary">Get Started Today →</Button>
          <Button className="btn-secondary flex items-center gap-2">
            <Play className="w-5 h-5" />
            View Services
          </Button>
        </div>

        {/* Bottom Icons */}
        <div className="flex items-center justify-center space-x-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
            <Code className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
            <User className="w-6 h-6 text-accent-foreground" />
          </div>
          <div className="w-12 h-12 bg-secondary-brand rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="w-12 h-12 bg-primary-glow rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
            <Newspaper className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
            <Mail className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
            <Home className="w-6 h-6 text-accent-foreground" />
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
