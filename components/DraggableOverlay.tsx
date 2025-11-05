import React, { useState, useRef } from "react";
import {
    View,
    Text,
    Image,
    PanResponder,
    GestureResponderEvent,
    PanResponderGestureState,
} from "react-native";
import { Overlay } from "../types/types";

interface DraggableOverlayProps {
    overlay: Overlay;
    onDragEnd: (overlay: Overlay) => void;
}

export function DraggableOverlay({
    overlay,
    onDragEnd,
}: DraggableOverlayProps) {
    const [pos, setPos] = useState({ x: overlay.x || 50, y: overlay.y || 50 });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (
                _evt: GestureResponderEvent,
                gestureState: PanResponderGestureState
            ) => {
                setPos({
                    x: Math.max(0, pos.x + gestureState.dx),
                    y: Math.max(0, pos.y + gestureState.dy),
                });
            },
            onPanResponderRelease: () => {
                onDragEnd({ ...overlay, x: pos.x, y: pos.y });
            },
        })
    ).current;

    return (
        <View
            {...panResponder.panHandlers}
            className="absolute z-10 shadow-lg"
            style={{ left: pos.x, top: pos.y }}
        >
            {overlay.type === "text" ? (
                <View className="bg-black/70 rounded-lg px-3 py-2 border border-white/20">
                    <Text className="text-white font-semibold text-base">
                        {overlay.content || "Text"}
                    </Text>
                </View>
            ) : overlay.type === "image" ? (
                <Image
                    source={{ uri: overlay.content }}
                    className="w-24 h-24 rounded-lg border-2 border-white/50"
                />
            ) : (
                <View className="w-24 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg justify-center items-center border-2 border-white/30">
                    <Text className="text-white font-bold text-sm">VIDEO</Text>
                    <Text className="text-white/80 text-xs">Clip</Text>
                </View>
            )}
        </View>
    );
}
