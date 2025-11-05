import React, { useState } from "react";
import { View, Alert, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer } from "expo-video";
import { Overlay } from "../types/types";
import { VideoPreview } from "./VideoPreview";
import { OverlayControls } from "./OverlayControls";
import { TextInputField } from "./TextInputField";
import { OverlayList } from "./OverlayList";
import { ActionButton } from "./ActionButton";

export default function EditorScreen() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [textValue, setTextValue] = useState<string>("");

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  function addOverlay(partialOverlay: Partial<Omit<Overlay, "id">>): void {
    const id = Date.now().toString();
    const newOverlay: Overlay = {
      id,
      x: 50,
      y: 50,
      start_time: 0,
      end_time: 3,
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

  async function submitToBackend(): Promise<void> {
    if (!videoUri) {
      Alert.alert("Error", "Please select a video first");
      return;
    }

    try {
      const metadata = overlays;
      const formData = new FormData();
      const filename = videoUri.split("/").pop() || "video.mp4";

      formData.append("video", {
        uri: videoUri,
        name: filename,
        type: "video/mp4",
      } as any);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await fetch("http://0.0.0.0:8000/upload", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();
      if (response.ok && data.job_id) {
        Alert.alert(
          "Success!",
          `Job created: ${data.job_id}\n\nPoll /status/${data.job_id} for updates`
        );
      } else {
        Alert.alert("Error", "Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Upload failed. Check your connection.");
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <ActionButton
          title="Pick Video"
          onPress={pickVideo}
          variant="secondary"
        />

        <VideoPreview
          videoUri={videoUri}
          player={player}
          overlays={overlays}
          onOverlayDragEnd={onDragEnd}
        />

        <OverlayControls
          onAddText={() =>
            addOverlay({
              type: "text",
              content: textValue || "Hello",
              start_time: 0,
              end_time: 3,
            })
          }
          onAddImage={pickImageForOverlay}
          onAddClip={() =>
            addOverlay({
              type: "video",
              content: "",
              start_time: 1,
              end_time: 4,
            })
          }
        />

        <TextInputField value={textValue} onChangeText={setTextValue} />

        <OverlayList overlays={overlays} />

        <ActionButton
          title="Submit to Backend"
          onPress={submitToBackend}
        />
      </View>
    </ScrollView>
  );
}