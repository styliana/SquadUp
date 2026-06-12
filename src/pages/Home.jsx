import HeroSection from '../components/home/HeroSection';
import TechMarquee from '../components/home/TechMarquee';
import StatsSection from '../components/home/StatsSection';

const Home = () => {
  return (
    <div className="relative w-[100vw] ml-[calc(-50vw+50%)] -mt-12 overflow-x-hidden pb-20">
      
      <div 
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50 pointer-events-none" 
        aria-hidden="true"
      />

      <HeroSection />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-32">
        <TechMarquee />
        <StatsSection />
      </div>
      
    </div>
  );
};

export default Home;