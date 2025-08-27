import { useState, useEffect } from 'react';
import { Moon, Sun, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect py-4' : 'py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <MessageSquare className="w-8 h-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-brand rounded-full animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary-brand bg-clip-text text-transparent">
            Klyra
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
            Home
          </a>
          <a href="#features" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
            Features
          </a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
            About
          </a>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
            Contact
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-glass-border/20 transition-colors duration-200"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          <Button className="btn-secondary hidden sm:flex">
            Admin
          </Button>
          
          <Button className="btn-primary">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;