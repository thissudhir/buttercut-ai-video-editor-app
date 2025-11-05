import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface OverlayControlsProps {
    onAddText: () => void;
    onAddImage: () => void;
    onAddClip: () => void;
}

export function OverlayControls({
    onAddText,
    onAddImage,
    onAddClip,
}: OverlayControlsProps) {
    return (
        <View className="bg-lr-card rounded-lg p-3 mb-4 border border-lr-border">
            <Text className="text-lr-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">
                Add Overlay
            </Text>
            <View className="flex-row justify-between gap-2">
                <TouchableOpacity
                    onPress={onAddText}
                    className="flex-1 bg-lr-blue rounded-lg py-3 items-center active:bg-lr-blue-dark"
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-semibold text-sm">Text</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onAddImage}
                    className="flex-1 bg-lr-teal rounded-lg py-3 items-center active:bg-lr-teal-dark"
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-semibold text-sm">Image</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onAddClip}
                    className="flex-1 bg-lr-purple rounded-lg py-3 items-center active:bg-lr-purple-dark"
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-semibold text-sm">Clip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
