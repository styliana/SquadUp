import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] 2xl:max-h-[800px] flex items-center overflow-hidden py-16 bg-background">
      
      {/* TŁO OBRAZKOWE Z RESPANSYWNĄ MASKĄ */}
      <div className="absolute inset-0 z-0 flex justify-center">
        <div className="relative w-full max-w-[1920px] h-full">
          
          <picture>
            <source srcSet="/hero-bg.webp" type="image/webp" />
            <img 
              src="/hero-bg.png" 
              alt="Squad Up Network Background" 
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-right sm:object-center select-none"
            />
          </picture>
          
          {/* MASKA KRYJĄCA:
            - Mobile (domyślnie): mocniejsze krycie przechodzące tylko do 60% tła (to-background/60)
            - Od tabletów (sm:): powrót do przezroczystości na prawym końcu (sm:to-transparent)
          */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60 sm:via-background/80 sm:to-transparent pointer-events-none"></div>

          {/* DELIKATNY BLUR NA MOBILE:
            Lekko rozmywa obrazek na małych ekranach, by zredukować "szum" pod tekstem. 
            Na większych ekranach (sm:backdrop-blur-none) obrazek staje się znowu ostry.
          */}
          <div className="absolute inset-0 backdrop-blur-[2px] sm:backdrop-blur-none pointer-events-none"></div>

          <div className="hidden 2xl:block absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* KONTENT WŁAŚCIWY */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left">
          
          {/* Skalowanie fontu: 4xl -> 5xl -> 7xl. Dodano drop-shadow dla kontrastu. */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-textMain mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-1000 drop-shadow-sm">
            Find your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary animate-gradient drop-shadow-sm">
              Dream Team
            </span>
          </h1>

          {/* Skalowanie akapitu: lg -> xl. Dodano drop-shadow. */}
          <p className="text-lg sm:text-xl text-textMuted mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 drop-shadow-sm">
            Don't waste time searching. Squad Up is a dynamic network where ambitious students connect instantly for hackathons, competitions, and portfolio projects.
          </p>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            
            <Link 
              to="/projects" 
              className="group relative px-8 py-4 bg-primary rounded-xl text-white font-semibold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all hover:-translate-y-1 w-full sm:w-auto text-center"
              aria-label="Browse all available projects"
            >
              <div className="flex items-center justify-center gap-2">
                Browse Projects
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </div>
            </Link>

            {/* Zmieniono backdrop-blur-sm na backdrop-blur-md, aby drugi przycisk na jasnym/ciemnym motywie był jeszcze czytelniejszy */}
            <Link 
              to="/create-project" 
              className="px-8 py-4 rounded-xl bg-white/5 border border-border text-textMain font-semibold text-lg hover:bg-white/10 transition-all hover:-translate-y-1 w-full sm:w-auto text-center backdrop-blur-md"
              aria-label="Create a new project listing"
            >
              Create Listing
            </Link>
            
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeroSection;