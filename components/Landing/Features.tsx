import { Shield, Video, Zap, Globe, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Video,
    title: 'HD Video Calls',
    description: 'Crystal clear video calls with adaptive quality for seamless communication.',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    icon: MessageCircle,
    title: 'Instant Messaging',
    description: 'Real-time chat with rich media support, emojis, and file sharing.',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    icon: Shield,
    title: 'End-to-End Encryption',
    description: 'Your conversations stay private and secure with military-grade encryption.',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    icon: Globe,
    title: 'Cross-platform',
    description: 'Works flawlessly on any device - desktop, mobile, or tablet. Always connected.',
    gradient: 'from-red-500 to-pink-600'
  }
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="features" className="relative py-20">
      {/* Fade in transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background via-background/50 to-transparent opacity-80" />
      
      {/* Blue-Black Circular Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large blue-black circular gradient */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-900/30 via-blue-800/25 to-black/20 rounded-full blur-3xl" />
        
        {/* Additional smaller blue-black gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-800/25 to-black/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-700/20 to-black/15 rounded-full blur-3xl" />
        
        {/* Subtle accent gradients */}
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-600/15 to-indigo-800/15 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
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
            seamless real-time communication and collaboration.
          </p>
        </motion.div>
        
        {/* Features Grid - Single Row */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="feature-card group"
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
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect hover-glow cursor-pointer group">
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
              Explore all features →
            </span>
          </div>
        </motion.div>
      </div>

      {/* Fade out transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80" />
    </section>
  );
};

export default Features;