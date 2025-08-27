import { ArrowRight, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-animation opacity-20" />
      <div className="absolute inset-0 grid-background opacity-10" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Floating Icons */}
          <div className="flex justify-center items-center mb-8 relative">
            <div className="absolute -left-16 top-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl glass-effect flex items-center justify-center animate-float">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect">
              <Users className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Join the Community</span>
            </div>
            
            <div className="absolute -right-16 top-4">
              <div className="w-12 h-12 bg-secondary-brand/20 rounded-2xl glass-effect flex items-center justify-center animate-float" 
                   style={{ animationDelay: '1s' }}>
                <Users className="w-6 h-6 text-secondary-brand" />
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to Transform
            <span className="block bg-gradient-to-r from-primary to-secondary-brand bg-clip-text text-transparent">
              Your Communication?
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who've already discovered the power of seamless, 
            real-time communication with Klyra.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button className="btn-primary group text-lg px-8 py-4">
              Join Klyra Today
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            
            <Button className="btn-secondary text-lg px-8 py-4">
              Schedule Demo
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-glass-border/30">
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
          </div>
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/10 to-secondary-brand/10 rounded-full blur-3xl opacity-50" />
    </section>
  );
};

export default CallToAction;