import React from "react";
import { View, TextInput, Text } from "react-native";

interface TextInputFieldProps {
    value: string;
    onChangeText: (text: string) => void;
}

export function TextInputField({ value, onChangeText }: TextInputFieldProps) {
    return (
        <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2 text-sm">
                Text Content
            </Text>
            <TextInput
                placeholder="Enter text for overlay..."
                value={value}
                onChangeText={onChangeText}
                className="border-2 border-gray-300 rounded-xl p-3 bg-white text-base"
                placeholderTextColor="#9CA3AF"
            />
        </View>
    );
}