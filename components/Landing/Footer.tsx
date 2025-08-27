import { MessageSquare, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-glass-border/30 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-brand rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary-brand bg-clip-text text-transparent">
                Klyra
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Empowering seamless communication through innovative chat and video technology.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-glass/50 rounded-xl glass-effect flex items-center justify-center hover-glow cursor-pointer group">
                <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </div>
              <div className="w-10 h-10 bg-glass/50 rounded-xl glass-effect flex items-center justify-center hover-glow cursor-pointer group">
                <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </div>
              <div className="w-10 h-10 bg-glass/50 rounded-xl glass-effect flex items-center justify-center hover-glow cursor-pointer group">
                <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </div>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Features</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Pricing</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">API</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Documentation</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">About</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Contact</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Security</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Privacy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Terms</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-glass-border/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground text-sm mb-4 md:mb-0">
            © 2024 Klyra. All rights reserved. Built with passion for communication.
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>hello@klyra.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;