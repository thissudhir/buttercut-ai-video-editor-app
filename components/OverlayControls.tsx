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
        <View className="flex-row justify-between mb-4 gap-2">
            <TouchableOpacity
                onPress={onAddText}
                className="flex-1 bg-blue-500 rounded-xl py-3 items-center shadow-md active:bg-blue-600"
            >
                <Text className="text-white font-bold text-base">Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onAddImage}
                className="flex-1 bg-green-500 rounded-xl py-3 items-center shadow-md active:bg-green-600"
            >
                <Text className="text-white font-bold text-base">Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onAddClip}
                className="flex-1 bg-purple-500 rounded-xl py-3 items-center shadow-md active:bg-purple-600"
            >
                <Text className="text-white font-bold text-base">Clip</Text>
            </TouchableOpacity>
        </View>
    );
}
