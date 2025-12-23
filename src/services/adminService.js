import { supabase } from '../supabaseClient';

const ITEMS_PER_PAGE = 10;

export const adminService = {
  // Pobieranie danych (Uniwersalne dla Users i Projects)
  fetchData: async (type, page, searchTerm) => {
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    let query;

    if (type === 'users') {
      query = supabase
        .from('profiles')
        .select('id, full_name, username, email, updated_at, role_id', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(from, to);

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }
    } else {
      query = supabase
        .from('projects')
        .select(`
          *,
          profiles:author_id ( full_name, email, username ),
          applications ( id )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
    }

    const { data, error, count } = await query;
    if (error) throw error;
    
    return { data, count };
  },

  // Usuwanie
  deleteItem: async (type, id) => {
    const table = type === 'users' ? 'profiles' : 'projects';
    // count: 'exact' pozwala sprawdzić czy cokolwiek usunięto
    const { error, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .eq('id', id);
    
    if (error) throw error;
    if (count === 0) throw new Error("Permission denied or item not found.");
    return true;
  },

  // Aktualizacja
  updateItem: async (type, id, data) => {
    const table = type === 'users' ? 'profiles' : 'projects';
    const { error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};