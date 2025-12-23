import { supabase } from '../supabaseClient';

export const projectService = {
  // 1. Pobieranie szczegółów projektu (READ)
  getById: async (id) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:author_id (*),
        categories ( name ),
        project_skills (
          skills ( id, name )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Transformacja danych dla Frontendu (spłaszczamy struktury)
    return {
      ...data,
      type: data.categories?.name || 'Unknown', // Mapowanie kategorii na string
      skills: data.project_skills?.map(ps => ps.skills) || [] // Mapowanie skilli na tablicę obiektów
    };
  },

  // 2. Tworzenie projektu (CREATE)
  create: async (projectData) => {
    return await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
  },

  // 3. Aktualizacja projektu (UPDATE)
  update: async (id, updates) => {
    return await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);
  },

  // 4. Dodawanie skilli (używane w CreateProject)
  addSkills: async (skills) => {
    if (!skills || skills.length === 0) return;
    return await supabase
      .from('project_skills')
      .insert(skills);
  },

  // 5. Aktualizacja skilli (używane w EditProject)
  updateSkills: async (projectId, newSkills) => {
    // A. Najpierw usuwamy wszystkie stare powiązania dla tego projektu
    const { error: deleteError } = await supabase
      .from('project_skills')
      .delete()
      .eq('project_id', projectId);
    
    if (deleteError) throw deleteError;

    // B. Następnie dodajemy nowe (jeśli są)
    if (newSkills && newSkills.length > 0) {
      return await supabase
        .from('project_skills')
        .insert(newSkills);
    }
  },

  // 6. Usuwanie projektu (DELETE)
  delete: async (id) => {
    return await supabase
      .from('projects')
      .delete()
      .eq('id', id);
  },

  // 7. (Opcjonalnie) Pobieranie projektów autora (do MyProjects)
  getByAuthor: async (userId) => {
    const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          categories ( name ),
          applications (
            *,
            profiles:applicant_id (*)
          )
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });
        
    if (error) throw error;
    return data;
  }
};