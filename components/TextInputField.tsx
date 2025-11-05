import React from "react";
import { View, TextInput, Text } from "react-native";

interface TextInputFieldProps {
    value: string;
    onChangeText: (text: string) => void;
}

export function TextInputField({ value, onChangeText }: TextInputFieldProps) {
    return (
        <View className="mb-4">
            <Text className="text-lr-text-secondary text-xs font-semibold uppercase tracking-wider mb-2 px-1">
                Text Content
            </Text>
            <TextInput
                placeholder="Enter text for overlay..."
                value={value}
                onChangeText={onChangeText}
                className="border-2 border-lr-border rounded-lg p-3 bg-lr-card text-lr-text-primary text-base"
                placeholderTextColor="#8a8a8a"
            />
        </View>
    );
}