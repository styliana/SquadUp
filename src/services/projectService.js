import { supabase } from '../supabaseClient';

/**
 * Pobiera szczegóły projektu na podstawie ID.
 * Dołącza:
 * 1. Profil autora (profiles:author_id)
 * 2. Listę aplikacji wraz z profilami kandydatów (potrzebne do Squad View)
 */
export const getProjectById = async (id) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:author_id(*),
      applications(
        status,
        profiles:applicant_id(*)
      )
    `) 
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};