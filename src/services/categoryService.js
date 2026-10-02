import { supabase } from '../supabaseClient';

let cachedCategories = null;
let inflightCategoriesPromise = null;

export const categoryService = {
  getAll: async (forceRefresh = false) => {
    if (!forceRefresh && cachedCategories) {
      return cachedCategories;
    }

    if (!forceRefresh && inflightCategoriesPromise) {
      return inflightCategoriesPromise;
    }

    inflightCategoriesPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name', { ascending: true });

        if (error) throw error;
        cachedCategories = data || [];
        return cachedCategories;
      } finally {
        inflightCategoriesPromise = null;
      }
    })();

    return inflightCategoriesPromise;
  },

  clearCache: () => {
    cachedCategories = null;
    inflightCategoriesPromise = null;
  },
};
