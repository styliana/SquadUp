import { useState, useEffect } from 'react';
import { getProjectById } from '../services/projectService';
import { toast } from 'sonner';

/**
 * Hook do pobierania i zarządzania stanem szczegółów projektu.
 * * @param {string} projectId - ID projektu do pobrania
 * @returns {Object} - { project, loading, error }
 */
export const useProjectDetails = (projectId) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Jeśli nie ma ID, nie próbuj pobierać
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getProjectById(projectId);
        setProject(data);
      } catch (err) {
        console.error("Błąd w useProjectDetails:", err);
        setError(err);
        toast.error("Project not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
};