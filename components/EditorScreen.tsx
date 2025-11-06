import React, { useState } from "react";
import { View, Alert, ScrollView, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer } from "expo-video";
import { Overlay } from "../types/types";
import { VideoPreview } from "./VideoPreview";
import { OverlayControls } from "./OverlayControls";
import { TextInputField } from "./TextInputField";
import { OverlayList } from "./OverlayList";
import { ActionButton } from "./ActionButton";
import { JobStatus } from "./JobStatus";

export default function EditorScreen() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [textValue, setTextValue] = useState<string>("");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const player = useVideoPlayer(videoUri || "", (player) => {
    player.loop = false;
    player.play();
  });

  async function pickVideo(): Promise<void> {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setVideoUri(res.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking video:", err);
    }
  }

  async function pickImageForOverlay(): Promise<void> {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsEditing: false,
        quality: 1,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        addOverlay({ type: "image", content: res.assets[0].uri });
      }
    } catch (err) {
      console.error("Error picking image:", err);
    }
  }

  async function pickVideoForOverlay(): Promise<void> {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        addOverlay({ type: "video", content: res.assets[0].uri });
      }
    } catch (err) {
      console.error("Error picking video clip:", err);
    }
  }

  function addOverlay(partialOverlay: Partial<Omit<Overlay, "id">>): void {
    if (!videoUri) {
      Alert.alert("Error", "Please select a video to add an overlay.");
      return;
    }
    const id = Date.now().toString();
    const currentTime = player.currentTime;
    const startTime =
      typeof currentTime === "number" && !isNaN(currentTime) ? currentTime : 0;

    const newOverlay: Overlay = {
      id,
      x: 50,
      y: 50,
      start_time: startTime,
      end_time: startTime + 3,
      type: "text",
      content: "",
      ...partialOverlay,
    };
    setOverlays((prev) => [...prev, newOverlay]);
  }

  function onDragEnd(updated: Overlay): void {
    setOverlays((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
  }

  function updateOverlay(updated: Overlay): void {
    setOverlays((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
  }

  function deleteOverlay(id: string): void {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
  }

  async function submitToBackend(): Promise<void> {
    if (!videoUri) {
      Alert.alert("Error", "Please select a video first");
      return;
    }

    try {
      const formData = new FormData();
      const filename = videoUri.split("/").pop() || "video.mp4";

      // Upload main video file
      formData.append("video", {
        uri: videoUri,
        name: filename,
        type: "video/mp4",
      } as any);

      // Upload image/video overlay files if they exist
      const processedOverlays = await Promise.all(
        overlays.map(async (overlay, index) => {
          if (overlay.type === "image" && overlay.content.startsWith("file://")) {
            const imageName = overlay.content.split("/").pop() || `image_${index}.jpg`;
            formData.append(`overlay_file_${index}`, {
              uri: overlay.content,
              name: imageName,
              type: "image/jpeg",
            } as any);
            return { ...overlay, content: imageName };
          } else if (overlay.type === "video" && overlay.content.startsWith("file://")) {
            const videoName = overlay.content.split("/").pop() || `clip_${index}.mp4`;
            formData.append(`overlay_file_${index}`, {
              uri: overlay.content,
              name: videoName,
              type: "video/mp4",
            } as any);
            return { ...overlay, content: videoName };
          }
          return overlay;
        })
      );


      const metadata = { overlays: processedOverlays };
      formData.append("metadata", JSON.stringify(metadata));


      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
      console.log("API URL:", apiUrl);
      console.log("Uploading to:", `${apiUrl}/api/v1/upload`);
      console.log("Video URI:", videoUri);
      console.log("Video filename:", filename);

      const response = await fetch(`${apiUrl}/api/v1/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();
      if (response.ok && data.job_id) {
        setCurrentJobId(data.job_id);
        Alert.alert("Success!", "Video uploaded successfully. Processing started.");
      } else {
        const errorMsg = data.detail || "Upload failed. Please try again.";
        Alert.alert("Error", errorMsg);
      }
    } catch (err) {
      console.error("Upload error:", err);
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
      Alert.alert(
        "Connection Error",
        `Cannot connect to backend at ${apiUrl}\n\nMake sure:\n1. Backend is running on port 8000\n2. Run: curl http://localhost:8000/health\n\nError: ${err}`
      );
    }
  }

  return (
    <ScrollView className="flex-1 bg-lr-darker">
      <View className="p-4">
        {/* Header Section */}
        <View className="mb-6">
          <Text className="text-lr-text-primary text-2xl font-bold mb-1">Buttercut.ai</Text>
          <Text className="text-lr-text-tertiary text-sm">Export your video & add overlays</Text>
        </View>

        {/* Pick Video Button */}
        <ActionButton
          title="Select Video"
          onPress={pickVideo}
          variant="secondary"
        />

        {/* Video Preview */}
        <VideoPreview
          videoUri={videoUri}
          player={player}
          overlays={overlays}
          onOverlayDragEnd={onDragEnd}
        />

        {/* Overlay Controls Section */}
        <View className="mb-6">
          <OverlayControls
            onAddText={() =>
              addOverlay({
                type: "text",
                content: textValue || "Hello",
              })
            }
            onAddImage={pickImageForOverlay}
            onAddClip={pickVideoForOverlay}
          />

          <TextInputField value={textValue} onChangeText={setTextValue} />
        </View>

        {/* Overlays List */}
        <OverlayList
          overlays={overlays}
          onUpdateOverlay={updateOverlay}
          onDeleteOverlay={deleteOverlay}
        />

        {/* Export Button */}
        <ActionButton
          title="Export Video"
          onPress={submitToBackend}
        />

        {/* Job Status Modal */}
        {currentJobId && (
          <JobStatus
            jobId={currentJobId}
            onClose={() => setCurrentJobId(null)}
          />
        )}
      </View>
    </ScrollView>
  );
}