import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const TechMarquee = () => {
  const [technologies, setTechnologies] = useState([]);

  useEffect(() => {
    const fetchPopularSkills = async () => {
      const { data } = await supabase
        .from('skills')
        .select('name')
        .order('usage_count', { ascending: false })
        .limit(20);
      
      if (data && data.length > 0) {
        setTechnologies(data.map(s => s.name));
      } else {
        setTechnologies([
          'React', 'Python', 'Node.js', 'TypeScript', 'Figma', 'Docker', 
          'AWS', 'Flutter', 'Go', 'Supabase', 'Next.js', 'PostgreSQL'
        ]);
      }
    };
    fetchPopularSkills();
  }, []);

  if (technologies.length === 0) return null;

  return (
    <div 
      className="mb-20 w-full overflow-hidden relative fade-sides animate-in fade-in zoom-in duration-1000 delay-300"
      aria-hidden="true"
    >
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex w-max animate-scroll gap-4">
        {[...technologies, ...technologies].map((tech, i) => (
          <div 
            key={i}
            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 font-medium text-lg whitespace-nowrap hover:text-textMain hover:border-border transition-colors cursor-default"
          >
            {tech}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechMarquee;