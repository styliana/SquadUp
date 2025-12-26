import { supabase } from '../supabaseClient';
import { APPLICATION_STATUS } from '../utils/constants'; // <--- Importujemy nasze stałe!

export const projectService = {
  // 1. Pobieranie szczegółów projektu
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

    // POPRAWKA: Używamy stałej zamiast wpisywać 'accepted' z ręki
    const acceptedCount = data.applications?.filter(
        app => app.status === APPLICATION_STATUS.ACCEPTED
    ).length || 0;
    
    // Liczba członków = autor (1) + zaakceptowani
    const realMembersCurrent = 1 + acceptedCount;

    return {
      ...data,
      type: data.categories?.name || 'Unknown',
      skills: data.project_skills?.map(ps => ps.skills) || [],
      applications: data.applications || [],
      members_current: realMembersCurrent
    };
  },

  // ... (metody create, update, delete, addSkills, updateSkills, getByAuthor - zostaw bez zmian) ...
  // Upewnij się tylko, że nie skasujesz ich przy wklejaniu! :)

  create: async (projectData) => {
    return await supabase.from('projects').insert([projectData]).select().single();
  },

  update: async (id, updates) => {
    return await supabase.from('projects').update(updates).eq('id', id);
  },

  addSkills: async (skills) => {
    if (!skills || skills.length === 0) return;
    return await supabase.from('project_skills').insert(skills);
  },

  updateSkills: async (projectId, newSkills) => {
    const { error: deleteError } = await supabase.from('project_skills').delete().eq('project_id', projectId);
    if (deleteError) throw deleteError;
    if (newSkills && newSkills.length > 0) {
      return await supabase.from('project_skills').insert(newSkills);
    }
  },

  delete: async (id) => {
    return await supabase.from('projects').delete().eq('id', id);
  },

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

  // 8. Aktualizacja statusu aplikacji
  updateApplicationStatus: async (applicationId, newStatus) => {
    // newStatus powinno pochodzić z APPLICATION_STATUS
    const { data, error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId)
      .select();

    if (error) throw error;
    return data;
  }
};