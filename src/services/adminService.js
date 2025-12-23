import { supabase } from '../supabaseClient';

const ITEMS_PER_PAGE = 10;

// Helper: Czy string jest poprawnym UUID?
const isUUID = (str) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

export const adminService = {
  fetchData: async (type, page, searchTerm, sortConfig) => {
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    const sortColumn = sortConfig?.column || 'created_at';
    const isAscending = sortConfig?.direction === 'asc';

    let query;

    if (type === 'users') {
      query = supabase
        .from('profiles')
        .select('id, full_name, username, email, updated_at, role_id', { count: 'exact' });

      if (searchTerm) {
        // Usuwamy znaki specjalne, które mogą psuć zapytanie URL
        const term = searchTerm.replace(/[%,]/g, ''); 
        
        // Domyślnie szukamy w polach tekstowych
        let orQuery = `email.ilike.%${term}%,full_name.ilike.%${term}%,username.ilike.%${term}%`;
        
        // Jeśli to UUID, dodajemy szukanie po ID
        if (isUUID(searchTerm)) {
          orQuery += `,id.eq.${searchTerm}`;
        }
        
        query = query.or(orQuery);
      }

      query = query.order(sortColumn, { ascending: isAscending });

    } else {
      // PROJECTS
      query = supabase
        .from('projects')
        .select(`
          *,
          profiles:author_id ( full_name, email, username ),
          applications ( id )
        `, { count: 'exact' });

      if (searchTerm) {
        const term = searchTerm.replace(/[%,]/g, '');
        let orQuery = `title.ilike.%${term}%,description.ilike.%${term}%`;
        
        if (isUUID(searchTerm)) {
          orQuery += `,id.eq.${searchTerm}`;
        }

        query = query.or(orQuery);
      }

      query = query.order(sortColumn, { ascending: isAscending });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    
    return { data, count };
  },

  deleteItem: async (type, id) => {
    const table = type === 'users' ? 'profiles' : 'projects';
    const { error, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .eq('id', id);
    
    if (error) throw error;
    if (count === 0) throw new Error("Item not found.");
    return true;
  },

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