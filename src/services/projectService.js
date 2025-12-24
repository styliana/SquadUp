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
        ),
        applications (
          id,
          status,
          profiles:applicant_id (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Obliczamy count dynamicznie
    const acceptedCount = data.applications?.filter(app => app.status === 'accepted').length || 0;
    const realMembersCurrent = 1 + acceptedCount;

    // Transformacja danych dla Frontendu
    return {
      ...data,
      type: data.categories?.name || 'Unknown',
      skills: data.project_skills?.map(ps => ps.skills) || [],
      applications: data.applications || [],
      members_current: realMembersCurrent // Aktualizacja licznika
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
    const { error: deleteError } = await supabase
      .from('project_skills')
      .delete()
      .eq('project_id', projectId);
    
    if (deleteError) throw deleteError;

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

  // 7. Pobieranie projektów autora
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
  },

  // 8. Aktualizacja statusu aplikacji (TEGO BRAKOWAŁO)
  updateApplicationStatus: async (applicationId, newStatus) => {
    const { data, error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId)
      .select();

    if (error) throw error;
    return data;
  }
};