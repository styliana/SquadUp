import { supabase } from '../supabaseClient';

export const categoryService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
