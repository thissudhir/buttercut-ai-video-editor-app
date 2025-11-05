import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Overlay } from "../types/types";

interface OverlayListProps {
    overlays: Overlay[];
}

export function OverlayList({ overlays }: OverlayListProps) {
    if (overlays.length === 0) {
        return (
            <View className="bg-gray-100 rounded-xl p-4 mb-4">
                <Text className="text-gray-500 text-center">
                    No overlays added yet
                </Text>
            </View>
        );
    }

    return (
        <View className="mb-4">
            <Text className="text-gray-800 font-bold text-lg mb-3">
                Active Overlays ({overlays.length})
            </Text>
            <ScrollView className="bg-white rounded-xl p-3 max-h-48 border border-gray-200">
                {overlays.map((overlay, index) => (
                    <View
                        key={overlay.id}
                        className={`py-3 ${index !== overlays.length - 1 ? 'border-b border-gray-200' : ''}`}
                    >
                        <View className="flex-row items-center justify-between mb-1">
                            <View className="flex-row items-center">
                                <View className={`w-2 h-2 rounded-full mr-2 ${overlay.type === 'text' ? 'bg-blue-500' :
                                    overlay.type === 'image' ? 'bg-green-500' :
                                        'bg-purple-500'
                                    }`} />
                                <Text className="font-semibold text-gray-800 capitalize">
                                    {overlay.type}
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-500">
                                ID: {overlay.id.slice(-4)}
                            </Text>
                        </View>
                        <Text className="text-sm text-gray-600 ml-4">
                            Position: ({Math.round(overlay.x)}, {Math.round(overlay.y)})
                        </Text>
                        <Text className="text-sm text-gray-600 ml-4">
                            Time: {overlay.start_time}s - {overlay.end_time}s
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
