import { useState, useEffect } from 'react';
import { getProjectById } from '../services/projectService';
import { toast } from 'sonner';
import useThrowAsyncError from './useThrowAsyncError';

export const useProjectDetails = (projectId) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Most do Error Boundary
  const throwAsyncError = useThrowAsyncError();

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getProjectById(projectId);
        setProject(data);
      } catch (err) {
        console.error("Error in useProjectDetails:", err);
        // Przekazujemy błąd krytyczny do globalnego Error Boundary
        throwAsyncError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]); // throwAsyncError jest stabilne

  return { project, loading };
};