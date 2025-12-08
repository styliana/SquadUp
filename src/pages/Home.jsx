import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Briefcase, Trophy } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Home = () => {
  const [stats, setStats] = useState({
    projects: 0,
    users: 0,
    matches: 0
  });

  // Pobieranie statystyk z bazy
  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.rpc('get_landing_stats');
      if (!error && data) {
        setStats(data);
      }
    };
    fetchStats();
  }, []);

  // Lista technologii do animowanego paska
  const technologies = [
    'React', 'Python', 'Node.js', 'TypeScript', 'Figma', 'Docker', 
    'AWS', 'Flutter', 'Go', 'Supabase', 'Next.js', 'PostgreSQL', 
    'Tailwind', 'AI/ML', 'Rust', 'GraphQL', 'Swift', 'Kotlin'
  ];

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-64px)] flex flex-col justify-center">
      
      {/* TŁO (Delikatna poświata) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-8 hover:bg-white/10 transition-colors cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={16} />
            <span>Seek Quality, Unite And Deliver</span>
          </div>

          {/* GŁÓWNY NAGŁÓWEK */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-1000">
            Find your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-secondary animate-gradient">
              Dream Team
            </span>
          </h1>

          {/* OPIS */}
          <p className="text-xl text-textMuted mb-16 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Don't waste time searching. Squad Up is a dynamic network where ambitious students connect instantly for hackathons, competitions, and portfolio projects.
          </p>

          {/* --- INFINITE MARQUEE (Nowy Pasek Technologii) --- */}
          <div className="mb-20 w-full overflow-hidden relative fade-sides animate-in fade-in zoom-in duration-1000 delay-300">
            {/* Gradientowe nakładki po bokach dla płynnego znikania */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

            <div className="flex w-max animate-scroll gap-4">
              {/* Renderujemy listę podwójnie, żeby pętla była nieskończona i płynna */}
              {[...technologies, ...technologies].map((tech, i) => (
                <div 
                  key={i}
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 font-medium text-lg whitespace-nowrap hover:text-white hover:border-white/20 transition-colors cursor-default"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>

          {/* PRZYCISKI (CTA) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
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

          {/* STATYSTYKI (Dynamiczne) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-10 animate-in fade-in duration-1000 delay-700">
            <StatItem 
              icon={<Briefcase className="text-primary mb-2" />} 
              end={stats.projects} 
              label="Active Projects" 
            />
            <StatItem 
              icon={<Users className="text-secondary mb-2" />} 
              end={stats.users} 
              label="Registered Students" 
            />
            <StatItem 
              icon={<Trophy className="text-yellow-400 mb-2" />} 
              end={stats.matches} 
              label="Successful Matches" 
            />
          </div>

        </div>
      </div>
    </div>
  );
};

// Komponent z efektem odliczania
const StatItem = ({ icon, end, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // Czas trwania animacji
    
    if (end === 0) return;
    
    const increment = end / (duration / 16); // 60 klatek na sekundę

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-white/5 transition-colors">
      {icon}
      <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-1">
        {count}
      </span>
      <span className="text-textMuted font-medium text-sm uppercase tracking-wide">{label}</span>
    </div>
  );
};

export default Home;