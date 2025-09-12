import { ArrowRight, Users, MessageCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CallToAction = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleJoinKlyra = () => {
    setIsNavigating(true);
    router.push('/auth');
  };

  return (
    <section id="call-to-action" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-animation opacity-10" />
      <div className="absolute inset-0 opacity-80" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Floating Icons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center items-center mb-8 relative"
          >
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-16 top-4"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-2xl glass-effect flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
            </motion.div>
            
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect">
              <Video className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Join the Community</span>
            </div>
            
            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-16 top-4"
            >
              <div className="w-12 h-12 bg-secondary-brand/20 rounded-2xl glass-effect flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary-brand" />
              </div>
            </motion.div>
          </motion.div>
          
          {/* Main Content */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            Ready to Transform
            <span className="block bg-gradient-to-r from-primary to-secondary-brand bg-clip-text text-transparent">
              Your Communication?
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Join millions of users who've already discovered the power of seamless, 
            real-time communication with Klyra's advanced video and chat platform.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button className="btn-primary group text-lg px-8 py-4" onClick={handleJoinKlyra} disabled={isNavigating}>
              {isNavigating ? 'Loading...' : 'Join Klyra Today'}
              {!isNavigating && (
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              )}
            </Button>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-glass-border/30"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">1M+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">150+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">4.9/5</div>
              <div className="text-sm text-muted-foreground">User Rating</div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/10 to-secondary-brand/10 rounded-full blur-3xl opacity-50" />
    </section>
  );
};

export default CallToAction;