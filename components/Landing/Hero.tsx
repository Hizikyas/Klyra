"use client";

import { Play, MessageCircle, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  const handleStartFreeTrial = () => {
    router.push('/auth');
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid Background - Only in Hero */}
      <div className="grid-background" />

      {/* Radial gradient for faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)]" />

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 gradient-animation opacity-80" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight"
        >
          The Future of
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Digital Communication
          </span>
          <br />
          Starts Here
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-muted-foreground text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed"
        >
          Experience the future of communication with Klyra - a powerful platform that combines 
          crystal-clear video calls, instant messaging, and seamless collaboration tools. 
          Connect with anyone, anywhere, anytime.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Button className="btn-primary group" onClick={handleStartFreeTrial}>
            Start Free Trial
            <Play className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </motion.div>
      </div>

      {/* Smooth transition gradient to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </section>
  );
}
