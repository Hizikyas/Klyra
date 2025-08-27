import { Shield, Video, Zap, Globe } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Messaging',
    description: 'End-to-end encrypted chats ensure your conversations stay private and secure.',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    icon: Video,
    title: 'HD Video Calls',
    description: 'Crystal clear video calls with adaptive quality for seamless communication.',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    icon: Zap,
    title: 'Real-time Sync',
    description: 'Messages delivered instantly with real-time synchronization across all devices.',
    gradient: 'from-yellow-500 to-orange-600'
  },
  {
    icon: Globe,
    title: 'Cross-platform',
    description: 'Works flawlessly on any device - desktop, mobile, or tablet. Always connected.',
    gradient: 'from-purple-500 to-pink-600'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 grid-background opacity-10" />
      
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect mb-6">
            <span className="text-sm font-medium text-primary">Features</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Built for Modern
            <span className="block bg-gradient-to-r from-primary to-secondary-brand bg-clip-text text-transparent">
              Communication
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the powerful features that make Klyra the perfect choice for 
            seamless real-time communication.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <div
                key={index}
                className="feature-card group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300`} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-200">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover Line */}
                <div className="w-0 h-0.5 bg-gradient-to-r from-primary to-secondary-brand mt-4 group-hover:w-full transition-all duration-300" />
              </div>
            );
          })}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect hover-glow cursor-pointer group">
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
              Explore all features →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;