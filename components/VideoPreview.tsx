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
        <View className="items-center justify-center mb-6">
            <View
                className="rounded-lg overflow-hidden border-2 border-lr-border bg-lr-darker"
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
                    <View className="flex-1 items-center justify-center bg-lr-darker">
                        <View className="items-center">
                            <View className="w-20 h-20 rounded-full bg-lr-panel items-center justify-center mb-4">
                                <Text className="text-4xl text-lr-text-tertiary">📹</Text>
                            </View>
                            <Text className="text-lr-text-secondary text-base font-semibold">
                                No video selected
                            </Text>
                            <Text className="text-lr-text-tertiary text-sm mt-2">
                                Select a video to begin editing
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
