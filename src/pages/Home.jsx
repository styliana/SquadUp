import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      
      {/* TŁO (Delikatna poświata z tyłu) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* BADGE (To małe u góry: Seek Quality...) */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-8 hover:bg-white/10 transition-colors cursor-default">
            <Sparkles size={16} />
            <span>Seek Quality, Unite And Deliver</span>
          </div>

          {/* GŁÓWNY NAGŁÓWEK */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Find your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-secondary animate-gradient">
              Dream Team
            </span>
          </h1>

          {/* OPIS */}
          <p className="text-xl text-textMuted mb-10 max-w-2xl mx-auto leading-relaxed">
            Build teams for hackathons, competitions, and portfolio projects. 
            Connect with students who have complementary skills.
          </p>

          {/* TAGI UMIEJĘTNOŚCI (Pigułki) */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['React', 'Python', 'Figma', 'Node.js', 'Flutter', 'Machine Learning'].map((skill) => (
              <span key={skill} className="px-4 py-1.5 rounded-full text-sm font-medium bg-surface border border-white/10 text-gray-300 hover:border-primary/50 hover:text-primary transition-all cursor-default">
                {skill}
              </span>
            ))}
          </div>

          {/* PRZYCISKI (CTA) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link 
              to="/projects" 
              className="group relative px-8 py-4 bg-gradient-to-r from-primary to-blue-600 rounded-xl text-white font-semibold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-2">
                Browse Projects
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              to="/create-project" 
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all hover:-translate-y-1"
            >
              Create Listing
            </Link>
          </div>

          {/* STATYSTYKI (Licznik na dole) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-10">
            <StatItem number="500+" label="Active Projects" />
            <StatItem number="2000+" label="Students" />
            <StatItem number="150+" label="Finished Teams" />
          </div>

        </div>
      </div>
    </div>
  );
};

// Mały komponent do statystyk, żeby nie powtarzać kodu
const StatItem = ({ number, label }) => (
  <div className="flex flex-col items-center">
    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-2">
      {number}
    </span>
    <span className="text-textMuted font-medium">{label}</span>
  </div>
);

export default Home;