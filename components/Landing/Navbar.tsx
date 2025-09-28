import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset navigation state when component unmounts or route changes
  useEffect(() => {
    return () => {
      setIsNavigating(false);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = useCallback(() => {
    if (isNavigating) return; // Prevent multiple clicks
    
    console.log('Get Started button clicked - navigating to /auth...');
    setIsNavigating(true);
    
    // Use requestAnimationFrame to ensure the state update is processed
    requestAnimationFrame(() => {
      try {
        router.replace('/auth');
      } catch (error) {
        console.error('Router navigation error:', error);
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect py-4' : 'py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => scrollToSection('home')}
        >
          <img src="/klyra_font.png" alt="Klyra Logo" width={70} height={70} />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a 
            onClick={() => scrollToSection('home')}
            className="text-foreground hover:text-primary transition-all duration-200 font-medium cursor-pointer nav-link-glow"
          >
            Home
          </a>
          <a 
            onClick={() => scrollToSection('features')}
            className="text-foreground hover:text-primary transition-all duration-200 font-medium cursor-pointer nav-link-glow"
          >
            Features
          </a>
          <a 
            onClick={() => scrollToSection('call-to-action')}
            className="text-foreground hover:text-primary transition-all duration-200 font-medium cursor-pointer nav-link-glow"
          >
            About
          </a>
          <a 
            onClick={() => scrollToSection('contact')}
            className="text-foreground hover:text-primary transition-all duration-200 font-medium cursor-pointer nav-link-glow"
          >
            Contact
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <Button 
            className="btn-primary" 
            onClick={handleGetStarted}
            disabled={isNavigating}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;