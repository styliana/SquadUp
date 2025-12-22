import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-border text-primary text-sm font-medium mb-8 hover:bg-white/10 transition-colors cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Sparkles size={16} aria-hidden="true" />
        <span>Seek Quality, Unite And Deliver</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold text-textMain mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-1000">
        Find your <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-secondary animate-gradient">
          Dream Team
        </span>
      </h1>

      <p className="text-xl text-textMuted mb-16 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
        Don't waste time searching. Squad Up is a dynamic network where ambitious students connect instantly for hackathons, competitions, and portfolio projects.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <Link 
          to="/projects" 
          className="group relative px-8 py-4 bg-gradient-to-r from-primary to-blue-600 rounded-xl text-textMain font-semibold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all hover:-translate-y-1"
          aria-label="Browse all available projects"
        >
          <div className="flex items-center gap-2">
            Browse Projects
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link 
          to="/create-project" 
          className="px-8 py-4 rounded-xl bg-white/5 border border-border text-textMain font-semibold text-lg hover:bg-white/10 transition-all hover:-translate-y-1"
          aria-label="Create a new project listing"
        >
          Create Listing
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;