import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import { ActionButton } from "./ActionButton";

interface JobStatusProps {
  jobId: string | null;
  onClose: () => void;
}

interface JobData {
  job_id: string;
  status: string;
  progress: number;
  message: string;
}

export function JobStatus({ jobId, onClose }: JobStatusProps) {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/v1/status/${jobId}`);
        const data = await response.json();

        setJobData(data);

        // Stop polling if job is done or errored
        if (data.status === "DONE" || data.status === "ERROR") {
          setPolling(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError("Failed to fetch job status");
        setPolling(false);
      }
    };

    // Initial poll
    pollStatus();

    // Set up polling interval
    const interval = setInterval(() => {
      if (polling) {
        pollStatus();
      }
    }, 2000); 

    return () => clearInterval(interval);
  }, [jobId, polling]);

  const downloadResult = async () => {
    if (!jobId) return;

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
      const downloadUrl = `${apiUrl}/api/v1/result/${jobId}`;

      // Open the download URL in browser
      const canOpen = await Linking.canOpenURL(downloadUrl);
      if (canOpen) {
        await Linking.openURL(downloadUrl);
      } else {
        setError("Cannot open download link");
      }
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download result");
    }
  };

  if (!jobId) return null;

  return (
    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-800">Job Status</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-gray-500 text-lg font-bold">✕</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View className="bg-red-50 p-3 rounded-lg mb-3">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : jobData ? (
        <View>
          <View className="mb-3">
            <Text className="text-sm text-gray-600 mb-1">Job ID:</Text>
            <Text className="text-xs font-mono bg-gray-100 p-2 rounded">
              {jobData.job_id}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm text-gray-600 mb-1">Status:</Text>
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${
                  jobData.status === "DONE"
                    ? "bg-green-500"
                    : jobData.status === "ERROR"
                    ? "bg-red-500"
                    : jobData.status === "PROCESSING"
                    ? "bg-blue-500"
                    : "bg-yellow-500"
                }`}
              />
              <Text className="text-sm font-semibold">{jobData.status}</Text>
            </View>
          </View>

          {jobData.status === "PROCESSING" && (
            <View className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-gray-600">Progress:</Text>
                <Text className="text-sm font-semibold">{jobData.progress}%</Text>
              </View>
              <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <View
                  className="bg-blue-500 h-full"
                  style={{ width: `${jobData.progress}%` }}
                />
              </View>
            </View>
          )}

          <View className="mb-3">
            <Text className="text-sm text-gray-600">Message:</Text>
            <Text className="text-sm text-gray-800">{jobData.message}</Text>
          </View>

          {jobData.status === "DONE" && (
            <ActionButton
              title="Download Result"
              onPress={downloadResult}
              variant="secondary"
            />
          )}

          {jobData.status === "PROCESSING" && (
            <View className="flex-row items-center justify-center py-2">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="ml-2 text-sm text-gray-600">Processing...</Text>
            </View>
          )}
        </View>
      ) : (
        <View className="flex-row items-center justify-center py-4">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="ml-3 text-gray-600">Loading job status...</Text>
        </View>
      )}
    </View>
  );
}
