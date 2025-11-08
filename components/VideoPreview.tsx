import React, { useCallback, useState } from "react";
import { View, Text, Dimensions, Pressable } from "react-native";
import { VideoView, VideoPlayer } from "expo-video";
import { Overlay } from "../types/types";
import DraggableOverlay from "./DraggableOverlay";
import { sortOverlaysByZIndex } from "../utils/overlayUtils";

const screenWidth = Dimensions.get("window").width;
const PREVIEW_WIDTH = screenWidth - 32;
const PREVIEW_HEIGHT = (PREVIEW_WIDTH * 4) / 3; // 16:9 aspect ratio

interface VideoPreviewProps {
    videoUri: string | null;
    player: VideoPlayer;
    overlays: Overlay[];
    selectedOverlayIds: string[];
    currentTime: number;
    zoom: number;
    snapToGrid: boolean;
    gridSize: number;
    onOverlayDragEnd: (overlay: Overlay) => void;
    onOverlaySelect: (id: string, multiSelect: boolean) => void;
    onTogglePlay: () => void;
}

export default React.memo(function VideoPreview({
    videoUri,
    player,
    overlays,
    selectedOverlayIds,
    currentTime,
    zoom,
    snapToGrid,
    gridSize,
    onOverlayDragEnd,
    onOverlaySelect,
    onTogglePlay,
}: VideoPreviewProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    // Sync button state with player
    React.useEffect(() => {
        if (!player || !videoUri) {
            setIsPlaying(false);
            return;
        }

        const updatePlayingState = () => {
            try {
                setIsPlaying(player.playing || false);
            } catch (error) {
                setIsPlaying(false);
            }
        };

        updatePlayingState();
        const interval = setInterval(updatePlayingState, 200);
        return () => clearInterval(interval);
    }, [player, videoUri]);

    const togglePlayPause = useCallback(() => {
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
        onTogglePlay();
    }, [player, onTogglePlay]);

    // Sort overlays by z-index for proper rendering order
    const sortedOverlays = sortOverlaysByZIndex(overlays);

    // Render grid overlay
    const renderGrid = () => {
        if (!snapToGrid) return null;

        const lines = [];
        const cols = Math.ceil(PREVIEW_WIDTH / gridSize);
        const rows = Math.ceil(PREVIEW_HEIGHT / gridSize);

        // Vertical lines
        for (let i = 0; i <= cols; i++) {
            lines.push(
                <View
                    key={`v-${i}`}
                    style={{
                        position: 'absolute',
                        left: i * gridSize,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    }}
                />
            );
        }

        // Horizontal lines
        for (let j = 0; j <= rows; j++) {
            lines.push(
                <View
                    key={`h-${j}`}
                    style={{
                        position: 'absolute',
                        top: j * gridSize,
                        left: 0,
                        right: 0,
                        height: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    }}
                />
            );
        }

        return (
            <View
                style={{
                    position: 'absolute',
                    width: PREVIEW_WIDTH,
                    height: PREVIEW_HEIGHT,
                    left: 0,
                    top: 0,
                }}
                pointerEvents="none"
            >
                {lines}
            </View>
        );
    };

    return (
        <View className="items-center justify-center mb-4">
            {/* Preview Container */}
            <View
                className="rounded-lg overflow-hidden border-2 border-lr-border bg-lr-darker relative"
                style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
            >
                {videoUri ? (
                    <>
                        {/* Video Layer */}
                        <VideoView
                            player={player}
                            style={{
                                width: PREVIEW_WIDTH,
                                height: PREVIEW_HEIGHT,
                                position: "absolute",
                                top: 0,
                                left: 0,
                            }}
                            nativeControls={false}
                            contentFit="contain"
                        />

                        {/* Grid Overlay */}
                        {renderGrid()}

                        {/* Overlays Layer */}
                        <View
                            style={{
                                width: PREVIEW_WIDTH,
                                height: PREVIEW_HEIGHT,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                        >
                            {sortedOverlays.map((overlay) => (
                                <DraggableOverlay
                                    key={overlay.id}
                                    overlay={overlay}
                                    onDragEnd={onOverlayDragEnd}
                                    onSelect={onOverlaySelect}
                                    isSelected={selectedOverlayIds.includes(overlay.id)}
                                    snapEnabled={snapToGrid}
                                    gridSize={gridSize}
                                    currentTime={currentTime}
                                />
                            ))}
                        </View>

                        {/* Zoom indicator */}
                        {zoom !== 1 && (
                            <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded">
                                <Text className="text-white text-xs font-mono">
                                    {(zoom * 100).toFixed(0)}%
                                </Text>
                            </View>
                        )}

                        {/* Snap to grid indicator */}
                        {snapToGrid && (
                            <View className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
                                <Text className="text-white text-xs">⊞ Grid: {gridSize}px</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <View className="flex-1 items-center justify-center bg-lr-darker">
                        <View className="items-center">
                            <View className="w-20 h-20 rounded-full bg-lr-panel items-center justify-center mb-4">
                                <Text className="text-4xl">📹</Text>
                            </View>
                            <Text className="text-lr-text-secondary text-base font-semibold">
                                No video selected
                            </Text>
                            <Text className="text-lr-text-tertiary text-sm mt-2 text-center px-4">
                                Select a video to begin editing
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Controls */}
            {videoUri && (
                <View className="mt-3 flex-row items-center gap-3">
                    {/* Play/Pause Button */}
                    <Pressable
                        onPress={togglePlayPause}
                        className="bg-lr-blue px-6 py-3 rounded-lg active:bg-lr-blue-dark flex-row items-center"
                    >
                        <Text className="text-white font-semibold text-base">
                            {isPlaying ? "⏸ Pause" : "▶ Play"}
                        </Text>
                    </Pressable>

                    {/* Selection Info */}
                    {selectedOverlayIds.length > 0 && (
                        <View className="bg-lr-panel px-3 py-2 rounded-lg">
                            <Text className="text-lr-text-secondary text-sm">
                                {selectedOverlayIds.length} selected
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Instructions */}
            {videoUri && overlays.length === 0 && (
                <View className="mt-3 bg-lr-panel px-4 py-2 rounded-lg">
                    <Text className="text-lr-text-tertiary text-xs text-center">
                        👆 Add overlays below and drag them to position
                    </Text>
                </View>
            )}
        </View>
    );
});
