"use client";

import { Play, MessageCircle, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

export default function Hero() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Reset navigation state when component unmounts
  useEffect(() => {
    return () => {
      setIsNavigating(false);
    };
  }, []);

  const handleStartFreeTrial = useCallback(() => {
    if (isNavigating) return; // Prevent multiple clicks
    
    console.log('Hero Start Here button clicked - navigating to /auth...');
    setIsNavigating(true);
    
    // Use requestAnimationFrame to ensure the state update is processed
    requestAnimationFrame(() => {
      try {
        router.replace('/auth');
      } catch (error) {
        console.error('Hero router navigation error:', error);
        // Fallback to window.location if router fails
        window.location.href = '/auth';
      }
    });
    
    // Reset navigation state after 2 seconds as fallback
    setTimeout(() => {
      setIsNavigating(false);
    }, 2000);
  }, [router, isNavigating]);

  return (
    <section id="home" className="relative pt-[12rem] min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Grid Background - Only in Hero */}
      <div className="grid-background opacity-60" />

      {/* Radial gradient for faded look */}
      {/* simplified to reduce heavy effects on first paint */}

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 gradient-animation opacity-30" />

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
          <Button className="btn-primary group" onClick={handleStartFreeTrial} disabled={isNavigating}>
            {isNavigating ? "Start Here..." : "Start Here"}
            {!isNavigating && (
              <Play className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Smooth transition gradient to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </section>
  );
}
