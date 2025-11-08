import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoProject } from '../types/types';

const PROJECTS_KEY = '@buttercut/projects';
const CURRENT_PROJECT_KEY = '@buttercut/current_project';

export function useProjectPersistence() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectsJson = await AsyncStorage.getItem(PROJECTS_KEY);
      const currentId = await AsyncStorage.getItem(CURRENT_PROJECT_KEY);

      if (projectsJson) {
        setProjects(JSON.parse(projectsJson));
      }
      if (currentId) {
        setCurrentProjectId(currentId);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProject = useCallback(async (project: VideoProject) => {
    try {
      const updatedProject = {
        ...project,
        updatedAt: Date.now(),
      };

      setProjects(prev => {
        const existing = prev.findIndex(p => p.id === project.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = updatedProject;
          AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
          return updated;
        } else {
          const updated = [...prev, updatedProject];
          AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
          return updated;
        }
      });

      return updatedProject;
    } catch (error) {
      console.error('Failed to save project:', error);
      return null;
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      setProjects(prev => {
        const updated = prev.filter(p => p.id !== projectId);
        AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
        return updated;
      });

      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
        await AsyncStorage.removeItem(CURRENT_PROJECT_KEY);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }, [currentProjectId]);

  const setCurrentProject = useCallback(async (projectId: string | null) => {
    try {
      setCurrentProjectId(projectId);
      if (projectId) {
        await AsyncStorage.setItem(CURRENT_PROJECT_KEY, projectId);
      } else {
        await AsyncStorage.removeItem(CURRENT_PROJECT_KEY);
      }
    } catch (error) {
      console.error('Failed to set current project:', error);
    }
  }, []);

  const getCurrentProject = useCallback((): VideoProject | null => {
    if (!currentProjectId) return null;
    return projects.find(p => p.id === currentProjectId) || null;
  }, [projects, currentProjectId]);

  return {
    projects,
    currentProject: getCurrentProject(),
    isLoading,
    saveProject,
    deleteProject,
    setCurrentProject,
    loadProjects,
  };
}
