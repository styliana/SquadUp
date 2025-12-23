import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useSkills = () => {
  const [allSkills, setAllSkills] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        // Pobieramy wszystkie skille posortowane po popularności (usage_count)
        const { data, error } = await supabase
          .from('skills')
          .select('id, name, usage_count')
          .order('usage_count', { ascending: false })
          .order('name', { ascending: true }); // Drugie kryterium: alfabetycznie

        if (error) throw error;

        if (data) {
          setAllSkills(data);
          // Popularne to np. top 7 najczęściej używanych (i mających > 0 użyć)
          setPopularSkills(data.filter(s => s.usage_count > 0).slice(0, 7));
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return { allSkills, popularSkills, loading };
};