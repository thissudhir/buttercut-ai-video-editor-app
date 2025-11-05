import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Overlay } from "../types/types";

interface OverlayListProps {
    overlays: Overlay[];
    onUpdateOverlay?: (overlay: Overlay) => void;
    onDeleteOverlay?: (id: string) => void;
}

export function OverlayList({ overlays, onUpdateOverlay, onDeleteOverlay }: OverlayListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Overlay>>({});

    if (overlays.length === 0) {
        return (
            <View className="bg-lr-card rounded-lg p-6 mb-4 border border-lr-border">
                <Text className="text-lr-text-tertiary text-center text-sm">
                    No overlays added yet
                </Text>
            </View>
        );
    }

    const startEditing = (overlay: Overlay) => {
        setEditingId(overlay.id);
        setEditValues({
            start_time: overlay.start_time,
            end_time: overlay.end_time,
            content: overlay.content,
        });
    };

    const saveEdits = (overlay: Overlay) => {
        if (onUpdateOverlay) {
            onUpdateOverlay({
                ...overlay,
                start_time: editValues.start_time ?? overlay.start_time,
                end_time: editValues.end_time ?? overlay.end_time,
                content: editValues.content ?? overlay.content,
            });
        }
        setEditingId(null);
        setEditValues({});
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValues({});
    };

    return (
        <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3 px-1">
                <Text className="text-lr-text-secondary text-xs font-semibold uppercase tracking-wider">
                    Active Overlays
                </Text>
                <View className="bg-lr-blue px-2.5 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">{overlays.length}</Text>
                </View>
            </View>
            <ScrollView className="bg-lr-card rounded-lg p-3 max-h-96 border border-lr-border">
                {overlays.map((overlay, index) => (
                    <View
                        key={overlay.id}
                        className={`py-3 ${index !== overlays.length - 1 ? 'border-b border-lr-divider' : ''}`}
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center">
                                <View className={`w-2 h-2 rounded-full mr-2 ${
                                    overlay.type === 'text' ? 'bg-lr-blue' :
                                    overlay.type === 'image' ? 'bg-lr-teal' :
                                    'bg-lr-purple'
                                }`} />
                                <Text className="font-semibold text-lr-text-primary capitalize text-sm">
                                    {overlay.type}
                                </Text>
                            </View>
                            <View className="flex-row gap-2">
                                {editingId === overlay.id ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => saveEdits(overlay)}
                                            className="bg-lr-green px-3 py-1.5 rounded-md active:bg-lr-green-dark"
                                            activeOpacity={0.8}
                                        >
                                            <Text className="text-white text-xs font-semibold">Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={cancelEditing}
                                            className="bg-lr-panel px-3 py-1.5 rounded-md active:bg-lr-dark"
                                            activeOpacity={0.8}
                                        >
                                            <Text className="text-lr-text-secondary text-xs font-semibold">Cancel</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => startEditing(overlay)}
                                            className="bg-lr-blue px-3 py-1.5 rounded-md active:bg-lr-blue-dark"
                                            activeOpacity={0.8}
                                        >
                                            <Text className="text-white text-xs font-semibold">Edit</Text>
                                        </TouchableOpacity>
                                        {onDeleteOverlay && (
                                            <TouchableOpacity
                                                onPress={() => onDeleteOverlay(overlay.id)}
                                                className="bg-lr-red px-3 py-1.5 rounded-md active:bg-lr-red-dark"
                                                activeOpacity={0.8}
                                            >
                                                <Text className="text-white text-xs font-semibold">Delete</Text>
                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>

                        {editingId === overlay.id && overlay.type === "text" ? (
                            <TextInput
                                value={editValues.content ?? overlay.content}
                                onChangeText={(text) => setEditValues({ ...editValues, content: text })}
                                className="bg-lr-panel p-2 rounded-md ml-4 mb-2 text-sm text-lr-text-primary border border-lr-border"
                                placeholder="Edit text content"
                                placeholderTextColor="#8a8a8a"
                            />
                        ) : (
                            overlay.type === "text" && (
                                <Text className="text-sm text-lr-text-secondary ml-4 mb-1">
                                    Content: {overlay.content}
                                </Text>
                            )
                        )}

                        <Text className="text-sm text-lr-text-tertiary ml-4">
                            Position: ({Math.round(overlay.x)}, {Math.round(overlay.y)})
                        </Text>

                        {editingId === overlay.id ? (
                            <View className="ml-4 mt-2 flex-row items-center gap-2">
                                <Text className="text-sm text-lr-text-secondary">Start:</Text>
                                <TextInput
                                    value={String(editValues.start_time ?? overlay.start_time)}
                                    onChangeText={(text) =>
                                        setEditValues({ ...editValues, start_time: parseFloat(text) || 0 })
                                    }
                                    keyboardType="numeric"
                                    className="bg-lr-panel px-2 py-1 rounded-md text-sm w-16 text-lr-text-primary border border-lr-border"
                                    placeholderTextColor="#8a8a8a"
                                />
                                <Text className="text-sm text-lr-text-tertiary">s</Text>
                                <Text className="text-sm text-lr-text-secondary">End:</Text>
                                <TextInput
                                    value={String(editValues.end_time ?? overlay.end_time)}
                                    onChangeText={(text) =>
                                        setEditValues({ ...editValues, end_time: parseFloat(text) || 0 })
                                    }
                                    keyboardType="numeric"
                                    className="bg-lr-panel px-2 py-1 rounded-md text-sm w-16 text-lr-text-primary border border-lr-border"
                                    placeholderTextColor="#8a8a8a"
                                />
                                <Text className="text-sm text-lr-text-tertiary">s</Text>
                            </View>
                        ) : (
                            <Text className="text-sm text-lr-text-tertiary ml-4">
                                Time: {overlay.start_time}s - {overlay.end_time}s
                            </Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
