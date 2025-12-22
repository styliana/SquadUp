import HeroSection from '../components/home/HeroSection';
import TechMarquee from '../components/home/TechMarquee';
import StatsSection from '../components/home/StatsSection';

const Home = () => {
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-64px)] flex flex-col justify-center">
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50" 
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <HeroSection />
        <TechMarquee />
        <StatsSection />
      </div>
    </div>
  );
};

export default Home;