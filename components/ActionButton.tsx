import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ActionButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
    disabled?: boolean;
}

export function ActionButton({
    title,
    onPress,
    variant = "primary",
    disabled = false
}: ActionButtonProps) {
    const bgColor = variant === "primary"
        ? disabled
            ? "bg-lr-border"
            : "bg-lr-blue active:bg-lr-blue-dark"
        : disabled
            ? "bg-lr-card"
            : "bg-lr-card active:bg-lr-panel border-2 border-lr-border";

    const textColor = disabled ? "text-lr-text-tertiary" : "text-lr-text-primary";

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`${bgColor} rounded-lg py-3.5 px-6 items-center justify-center mb-3 shadow-lg`}
            activeOpacity={0.8}
        >
            <Text className={`${textColor} font-semibold text-base tracking-wide`}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}