import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    Image,
    PanResponder,
    GestureResponderEvent,
    PanResponderGestureState,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Overlay } from "../types/types";

interface DraggableOverlayProps {
    overlay: Overlay;
    onDragEnd: (overlay: Overlay) => void;
}

export function DraggableOverlay({
    overlay,
    onDragEnd,
}: DraggableOverlayProps) {
    const viewRef = useRef<View>(null);
    const position = useRef({ x: overlay.x || 50, y: overlay.y || 50 });
    const dragStartPos = useRef({ x: 0, y: 0 });

    // Create video player for video overlays
    const videoPlayer = useVideoPlayer(
        overlay.type === "video" && overlay.content ? overlay.content : "",
        (player) => {
            player.loop = true;
            player.muted = true; // Mute overlay videos to avoid audio conflicts
            player.play(); // Auto-play the overlay video
        }
    );

    useEffect(() => {
        position.current = { x: overlay.x || 50, y: overlay.y || 50 };
    }, [overlay.x, overlay.y]);

    // Ensure video overlay plays when content changes
    useEffect(() => {
        if (overlay.type === "video" && overlay.content && videoPlayer) {
            videoPlayer.play();
        }
    }, [overlay.content, overlay.type, videoPlayer]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                dragStartPos.current = { x: position.current.x, y: position.current.y };
            },
            onPanResponderMove: (
                _evt: GestureResponderEvent,
                gestureState: PanResponderGestureState
            ) => {
                const newX = dragStartPos.current.x + gestureState.dx;
                const newY = dragStartPos.current.y + gestureState.dy;
                viewRef.current?.setNativeProps({ style: { left: newX, top: newY } });
            },
            onPanResponderRelease: (_evt, gestureState) => {
                const finalX = dragStartPos.current.x + gestureState.dx;
                const finalY = dragStartPos.current.y + gestureState.dy;
                
                position.current = { x: Math.max(0, finalX), y: Math.max(0, finalY) };

                onDragEnd({ ...overlay, ...position.current });
            },
        })
    ).current;

    return (
        <View
            ref={viewRef}
            className="absolute z-50"
            style={{ left: overlay.x || 50, top: overlay.y || 50 }}
        >
            <View {...panResponder.panHandlers} className="shadow-lg" style={{ touchAction: 'none' }}>
                {overlay.type === "text" ? (
                    <View className="bg-black/70 rounded-lg px-3 py-2 border-2 border-yellow-400">
                        <Text className="text-white font-semibold text-base">
                            {overlay.content || "Text"}
                        </Text>
                    </View>
                ) : overlay.type === "image" ? (
                    <View className="border-2 border-yellow-400 rounded-lg" pointerEvents="box-only">
                        <Image
                            source={{ uri: overlay.content }}
                            className="w-24 h-24 rounded-lg"
                        />
                    </View>
                ) : overlay.type === "video" && overlay.content ? (
                    <View className="border-2 border-yellow-400 rounded-lg overflow-hidden" pointerEvents="box-only">
                        <VideoView
                            player={videoPlayer}
                            style={{ width: 128, height: 96 }}
                            contentFit="cover"
                            nativeControls={false}
                        />
                    </View>
                ) : (
                    <View className="w-32 h-24 bg-purple-600/80 rounded-lg justify-center items-center border-2 border-yellow-400">
                        <Text className="text-white font-bold text-sm">VIDEO</Text>
                        <Text className="text-white/80 text-xs">No clip selected</Text>
                    </View>
                )}
            </View>
        </View>
    );
}
