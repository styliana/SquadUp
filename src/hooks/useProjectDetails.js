import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projectService } from '../services/projectService';

export const useProjectDetails = (id) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await projectService.getById(id);
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Project not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { project, loading };
};