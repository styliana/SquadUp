import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { sortProjectsByRelevance } from '../utils/recommendationAlgo'; // Importujemy nasz silnik

export const useProjects = (user) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [userProfile, setUserProfile] = useState({});

  // 1. Pobieranie profilu (bez zmian)
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            profile_skills (
              skills ( id, name )
            )
          `)
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          const formattedSkills = data.profile_skills
            ?.map(ps => ps.skills?.name)
            .filter(name => typeof name === 'string') 
            || [];
          
          setUserProfile({
            ...data,
            skills: formattedSkills 
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    fetchProfile();
  }, [user]);

  // 2. Pobieranie projektów
  const fetchProjects = useCallback(async (filters, isReset) => {
    const { page = 0, searchTerm = '', selectedType = 'All', selectedSkills = [], showRecommended = false } = filters;
    const PAGE_SIZE = 6;

    try {
      setLoading(true);

      // --- LOGIKA REKOMENDACJI ---
      // Jeśli użytkownik chce "For You", musimy zmienić strategię.
      // Pobieramy więcej danych naraz, żeby móc je posortować algorytmem w JS.
      // W SQL trudno jest zrobić "ORDER BY score" gdzie score to skomplikowana logika.
      const isRecommendationMode = showRecommended && (userProfile?.preferred_categories?.length > 0 || userProfile?.skills?.length > 0);

      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles:author_id ( full_name, avatar_url, email ),
          categories!inner ( id, name ),
          project_skills (
            skills ( id, name )
          )
        `, { count: 'exact' })
        .eq('status_id', 1); // Tylko otwarte

      // Sortowanie: Jeśli rekomendacje, nie sortujemy w bazie (zrobimy to w JS).
      // Jeśli zwykły widok - sortujemy po dacie.
      if (!isRecommendationMode) {
        query = query.order('created_at', { ascending: false });
        // Paginacja w bazie tylko dla zwykłego trybu
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);
      } else {
        // W trybie rekomendacji pobieramy np. 100 ostatnich projektów do analizy
        // (W przyszłości można to przenieść do funkcji RPC w bazie dla wydajności)
        query = query.order('created_at', { ascending: false }).limit(100);
      }

      // --- FILTROWANIE PODSTAWOWE ---
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      if (selectedType && selectedType !== 'All') {
        query = query.eq('categories.name', selectedType);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      // Transformacja danych (mapowanie skilli i typu)
      let formattedData = data.map(p => ({
        ...p,
        type: p.categories?.name || 'Unknown', 
        skills: p.project_skills
            ?.map(ps => ps.skills?.name)
            .filter(name => typeof name === 'string') 
            || []
      }));

      // --- FILTROWANIE ZAAWANSOWANE (Client-side) ---
      
      // 1. Filtr po konkretnych skillach wybranych w UI
      if (selectedSkills.length > 0) {
        const requiredSkills = selectedSkills.map(s => s.name?.toLowerCase()).filter(Boolean); 
        formattedData = formattedData.filter(p => 
          p.skills.some(skillName => requiredSkills.includes(skillName.toLowerCase()))
        );
      }

      // 2. SORTOWANIE "FOR YOU" (Nasz algorytm!)
      if (isRecommendationMode) {
        // Używamy naszej funkcji z recommendationAlgo.js
        formattedData = sortProjectsByRelevance(formattedData, userProfile);
        
        // Symulacja paginacji po stronie klienta (bo pobraliśmy 100 sztuk)
        // Jeśli to strona 0, bierzemy pierwsze 6. Jeśli 1, kolejne 6 itd.
        // Uwaga: To uproszczenie dla MVP.
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        // Zapisujemy pełną listę posortowaną tylko jeśli to pierwsza strona lub reset
        // Ale musimy zwrócić tylko wycinek, żeby 'Load More' działało wizualnie
        const paginatedSlice = formattedData.slice(from, to);
        
        // Jeśli jesteśmy w trybie rekomendacji, nadpisujemy 'data' tym wycinkiem
        // Ale najpierw musimy obsłużyć stan w setProjects
        
        // W trybie rekomendacji musimy inaczej zarządzać 'hasMore'
        setHasMore(to < formattedData.length);
        formattedData = paginatedSlice;
      } else {
        // Standardowa paginacja z bazy
        if (count !== null) {
           const to = (page * PAGE_SIZE) + PAGE_SIZE - 1;
           setHasMore(to < count - 1);
        } else {
           setHasMore(data.length === PAGE_SIZE);
        }
      }

      // --- AKTUALIZACJA STANU ---
      setProjects(prev => {
        if (isReset) return formattedData; 
        
        const existingIds = new Set(prev.map(p => p.id));
        const newUnique = formattedData.filter(p => !existingIds.has(p.id));
        return [...prev, ...newUnique];
      });

    } catch (err) {
      console.error("Fetch projects error:", err);
      toast.error("Could not load projects");
    } finally {
      setLoading(false);
    }
  }, [userProfile]); 

  return { projects, loading, hasMore, fetchProjects, userProfile };
};