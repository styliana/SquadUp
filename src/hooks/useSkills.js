import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

let cachedAllSkills = null;
let cachedPopularSkills = null;
let inflightSkillsPromise = null;

const fetchSkillsFromApi = async () => {
  if (cachedAllSkills) {
    return { allSkills: cachedAllSkills, popularSkills: cachedPopularSkills };
  }
  if (inflightSkillsPromise) {
    return inflightSkillsPromise;
  }

  inflightSkillsPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, usage_count')
        .order('usage_count', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;

      cachedAllSkills = data || [];
      cachedPopularSkills = cachedAllSkills.filter(s => s.usage_count > 0).slice(0, 7);
      return { allSkills: cachedAllSkills, popularSkills: cachedPopularSkills };
    } finally {
      inflightSkillsPromise = null;
    }
  })();

  return inflightSkillsPromise;
};

export const useSkills = () => {
  const [allSkills, setAllSkills] = useState(cachedAllSkills || []);
  const [popularSkills, setPopularSkills] = useState(cachedPopularSkills || []);
  const [loading, setLoading] = useState(!cachedAllSkills);

  useEffect(() => {
    if (cachedAllSkills) return;

    let isMounted = true;
    fetchSkillsFromApi()
      .then(res => {
        if (isMounted) {
          setAllSkills(res.allSkills);
          setPopularSkills(res.popularSkills);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching skills:', error);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { allSkills, popularSkills, loading };
};