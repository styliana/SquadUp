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
    // ZMIANA: Pobieramy email z pliku .env zamiast wpisywać go na sztywno
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    
    // Sprawdzamy, czy currentUser to właściciel (fallback)
    // Działa tylko jeśli adminEmail jest zdefiniowany w .env
    const isOwner = adminEmail && currentUser.email === adminEmail;
    
    try {
      // Timeout Promise (2 sekundy) - zabezpieczenie przed wolną bazą
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout checkUserRole')), 2000)
      );

      // Zapytanie do bazy
      const dbPromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      // Wyścig: Baza vs Timeout
      const { data, error } = await Promise.race([dbPromise, timeoutPromise]);

      if (error) throw error;

      // Logika uprawnień: Baza ma pierwszeństwo, ale isOwner to nasza "tylna furtka"
      if (data?.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(isOwner); 
      }

    } catch (err) {
      // Jeśli to timeout lub błąd bazy, logujemy ostrzeżenie (tylko w dev)
      if (import.meta.env.DEV) {
         console.warn('⚠️ Role check failed/timed out:', err);
      }
      
      // FALLBACK: Jeśli baza padnie, ufamy zmiennej środowiskowej
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
          // Nie ustawiamy loadera na true przy zmianie sesji, żeby nie migać interfejsem
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-400 font-mono text-sm">Loading user data...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};