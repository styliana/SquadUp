import { useState, useEffect } from 'react';
import { Briefcase, Users, Trophy } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import StatItem from './StatItem';

const StatsSection = () => {
  const [stats, setStats] = useState({
    projects: 0,
    users: 0,
    matches: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_landing_stats');
        
        if (error) {
            console.error('Error fetching stats:', error);
            return;
        }

        // Sprawdzamy czy data istnieje, jeśli nie - zostawiamy zera
        if (data) {
          setStats({
            projects: data.projects || 0,
            users: data.users || 0,
            matches: data.matches || 0
          });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border pt-10 animate-in fade-in duration-1000 delay-700"
      aria-label="Platform Statistics"
    >
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
  );
};

export default StatsSection;