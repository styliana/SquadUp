import { supabase } from '../supabaseClient';

/**
 * Pobiera szczegóły projektu na podstawie ID, włączając dane profilu autora.
 * * @param {string} id - UUID projektu
 * @returns {Promise<Object>} - Obiekt projektu z danymi autora (profiles)
 * @throws {Error} - Rzuca błąd w przypadku niepowodzenia zapytania
 */
export const getProjectById = async (id) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles:author_id(*)') 
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};