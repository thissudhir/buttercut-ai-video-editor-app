import React from "react";
import { View, Text, Dimensions } from "react-native";
import { VideoView, VideoPlayer } from "expo-video";
import { Overlay } from "../types/types";
import { DraggableOverlay } from "./DraggableOverlay";

const screenWidth = Dimensions.get("window").width;
const PREVIEW_WIDTH = screenWidth - 32;
const PREVIEW_HEIGHT = (PREVIEW_WIDTH * 4) / 3;

interface VideoPreviewProps {
    videoUri: string | null;
    player: VideoPlayer;
    overlays: Overlay[];
    onOverlayDragEnd: (overlay: Overlay) => void;
}

export function VideoPreview({
    videoUri,
    player,
    overlays,
    onOverlayDragEnd,
}: VideoPreviewProps) {
    return (
        <View className="items-center justify-center mb-4">
            <View
                className="bg-gray- rounded-2xl overflow-hidden shadow-xl border border-gray-700"
                style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
            >
                {videoUri ? (
                    <>
                        <VideoView
                            player={player}
                            style={{ width: "100%", height: "100%" }}
                            nativeControls
                            contentFit="contain"
                        />
                        {overlays.map((overlay) => (
                            <DraggableOverlay
                                key={overlay.id}
                                overlay={overlay}
                                onDragEnd={onOverlayDragEnd}
                            />
                        ))}
                    </>
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-gray-400 text-lg font-medium">
                            No video selected
                        </Text>
                        <Text className="text-gray-500 text-sm mt-2">
                            Pick a video to get started
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
