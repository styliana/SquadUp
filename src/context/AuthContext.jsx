import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Funkcja sprawdzająca rolę z "bezpiecznikiem" czasowym
  const checkUserRole = async (currentUser) => {
    // 1. HARD CHECK (Zawsze działa): Jeśli to Ty, masz admina od razu.
    // To zapobiega zablokowaniu się panelu, gdy baza ma gorszy dzień.
    const isOwner = currentUser.email === 'olagolek2@gmail.com';
    
    try {
      // Tworzymy obietnicę, która "wybucha" po 2 sekundach (żeby nie czekać w nieskończoność)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );

      // Pytamy bazę danych
      const dbPromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      // Wyścig: Kto pierwszy? Baza czy Timeout?
      const { data, error } = await Promise.race([dbPromise, timeoutPromise]);

      if (error) throw error;

      // Jeśli baza odpowiedziała:
      if (data?.role === 'admin') {
        setIsAdmin(true);
      } else {
        // Jeśli baza mówi "nie", ale to Ty (isOwner) -> dajemy Admina
        setIsAdmin(isOwner); 
      }

    } catch (err) {
      console.warn('⚠️ Baza nie odpowiedziała na czas lub wystąpił błąd:', err);
      // FALLBACK: W przypadku błędu bazy, ufamy emailowi
      setIsAdmin(isOwner);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          if (currentUser) {
            await checkUserRole(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // Nie ustawiamy setLoading(true) tutaj, żeby nie migać ekranem
          await checkUserRole(currentUser);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
    isAdmin,
    loading
  };

  // Jeśli ładowanie trwa, pokazujemy loader, ale dzięki timeoutowi w checkUserRole
  // zniknie on maksymalnie po 2 sekundach.
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-textMuted font-mono text-sm">Wczytywanie...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};