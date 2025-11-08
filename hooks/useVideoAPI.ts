import { useState, useCallback } from 'react';
import { UploadResponse, JobStatus } from '../types/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export function useVideoAPI() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Upload video with overlays
  const uploadVideo = useCallback(async (
    videoUri: string,
    overlays: any[],
    overlayFiles: { [key: number]: string } = {}
  ): Promise<UploadResponse | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Add video file
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'video.mp4',
      } as any);

      // Add overlay files (images/videos)
      Object.entries(overlayFiles).forEach(([index, uri]) => {
        const fileType = uri.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'video';
        formData.append(`overlay_file_${index}`, {
          uri,
          type: fileType === 'image' ? 'image/jpeg' : 'video/mp4',
          name: `overlay_${index}.${fileType === 'image' ? 'jpg' : 'mp4'}`,
        } as any);
      });

      // Add metadata
      formData.append('metadata', JSON.stringify({ overlays }));

      const response = await fetch(`${API_URL}/api/v1/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      setUploadProgress(100);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Get job status
  const getJobStatus = useCallback(async (jobId: string): Promise<JobStatus | null> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/status/${jobId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch job status');
      }

      const data: JobStatus = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to get job status');
      return null;
    }
  }, []);

  // Get result download URL
  const getResultUrl = useCallback((jobId: string): string => {
    return `${API_URL}/api/v1/result/${jobId}`;
  }, []);

  // Delete job
  const deleteJob = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/job/${jobId}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
      return false;
    }
  }, []);

  return {
    uploadVideo,
    getJobStatus,
    getResultUrl,
    deleteJob,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null),
  };
}
