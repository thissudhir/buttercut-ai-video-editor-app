import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ActionButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
}

export function ActionButton({
    title,
    onPress,
    variant = "primary"
}: ActionButtonProps) {
    const bgColor = variant === "primary"
        ? "bg-indigo-600 active:bg-indigo-700"
        : "bg-gray-700 active:bg-gray-800";

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${bgColor} rounded-xl py-4 items-center shadow-lg mb-3`}
        >
            <Text className="text-white font-bold text-base">
                {title}
            </Text>
        </TouchableOpacity>
    );
}