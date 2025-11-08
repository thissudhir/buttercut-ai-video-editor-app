import React, { useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    Image,
    PanResponder,
    GestureResponderEvent,
    PanResponderGestureState,
    Pressable,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Overlay } from "../types/types";
import { snapToGrid, DEFAULT_OVERLAY_VALUES } from "../utils/overlayUtils";

interface DraggableOverlayProps {
    overlay: Overlay;
    onDragEnd: (overlay: Overlay) => void;
    onSelect?: (id: string, multiSelect: boolean) => void;
    isSelected?: boolean;
    snapEnabled?: boolean;
    gridSize?: number;
    currentTime: number;
}

export default React.memo(function DraggableOverlay({
    overlay,
    onDragEnd,
    onSelect,
    isSelected = false,
    snapEnabled = false,
    gridSize = 10,
    currentTime,
}: DraggableOverlayProps) {
    const viewRef = useRef<View>(null);
    const position = useRef({ x: overlay.x, y: overlay.y });
    const dragStartPos = useRef({ x: 0, y: 0 });
    const isDragging = useRef(false);

    // Check if overlay should be visible at current time
    const isVisibleAtTime = currentTime >= overlay.start_time && currentTime <= overlay.end_time;
    const shouldShow = overlay.visible ?? true;

    // Create video player for video overlays
    const videoPlayer = useVideoPlayer(
        overlay.type === "video" && overlay.content ? overlay.content : "",
        (player) => {
            player.loop = true;
            player.muted = true;
            player.play();
        }
    );

    // Update position when overlay position changes externally
    useEffect(() => {
        if (!isDragging.current) {
            position.current = { x: overlay.x, y: overlay.y };
            // Force update the visual position
            viewRef.current?.setNativeProps({
                style: {
                    left: overlay.x,
                    top: overlay.y
                }
            });
        }
    }, [overlay.x, overlay.y]);

    useEffect(() => {
        if (overlay.type === "video" && overlay.content && videoPlayer) {
            videoPlayer.play();
        }
    }, [overlay.content, overlay.type, videoPlayer]);

    // Track if this was a drag or just a tap
    const wasDragged = useRef(false);

    // Create PanResponder with useCallback to ensure it updates properly
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !overlay.locked,
            onStartShouldSetPanResponderCapture: () => !overlay.locked,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only become responder if moved more than 2 pixels (helps distinguish tap from drag)
                return !overlay.locked && (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2);
            },
            onMoveShouldSetPanResponderCapture: (_, gestureState) => {
                return !overlay.locked && (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2);
            },
            onPanResponderGrant: () => {
                isDragging.current = true;
                wasDragged.current = false;
                dragStartPos.current = { x: position.current.x, y: position.current.y };

                // Handle selection on touch
                if (onSelect) {
                    onSelect(overlay.id, false);
                }
            },
            onPanResponderMove: (
                _evt: GestureResponderEvent,
                gestureState: PanResponderGestureState
            ) => {
                if (overlay.locked) return;

                wasDragged.current = true;
                let newX = dragStartPos.current.x + gestureState.dx;
                let newY = dragStartPos.current.y + gestureState.dy;

                // Apply snap to grid during drag (visual feedback)
                if (snapEnabled) {
                    newX = snapToGrid(newX, gridSize);
                    newY = snapToGrid(newY, gridSize);
                }

                // Constrain to non-negative values
                newX = Math.max(0, newX);
                newY = Math.max(0, newY);

                // Update position ref
                position.current = { x: newX, y: newY };

                // Update visual position immediately
                viewRef.current?.setNativeProps({
                    style: {
                        left: newX,
                        top: newY
                    }
                });
            },
            onPanResponderRelease: (_evt, gestureState) => {
                if (overlay.locked) {
                    isDragging.current = false;
                    return;
                }

                // Only update if actually dragged
                if (wasDragged.current) {
                    let finalX = dragStartPos.current.x + gestureState.dx;
                    let finalY = dragStartPos.current.y + gestureState.dy;

                    // Apply snap to grid on release
                    if (snapEnabled) {
                        finalX = snapToGrid(finalX, gridSize);
                        finalY = snapToGrid(finalY, gridSize);
                    }

                    // Constrain to non-negative values
                    finalX = Math.max(0, finalX);
                    finalY = Math.max(0, finalY);

                    // Update position ref
                    position.current = { x: finalX, y: finalY };

                    // Notify parent component
                    console.log(`Overlay ${overlay.id} dragged to position: x=${finalX}, y=${finalY}`);
                    onDragEnd({
                        ...overlay,
                        x: finalX,
                        y: finalY
                    });
                }

                isDragging.current = false;
                wasDragged.current = false;
            },
        })
    ).current;

    // Handle tap for selection (only if not dragged)
    const handlePress = useCallback(() => {
        if (onSelect && !overlay.locked && !wasDragged.current) {
            onSelect(overlay.id, false);
        }
    }, [onSelect, overlay.id, overlay.locked]);

    // Extract properties with defaults
    const opacity = overlay.opacity ?? DEFAULT_OVERLAY_VALUES.opacity;
    const rotation = overlay.rotation ?? DEFAULT_OVERLAY_VALUES.rotation;
    const scale = overlay.scale ?? DEFAULT_OVERLAY_VALUES.scale;
    const width = overlay.width ?? DEFAULT_OVERLAY_VALUES.width;
    const height = overlay.height ?? DEFAULT_OVERLAY_VALUES.height;
    const fontSize = overlay.fontSize ?? DEFAULT_OVERLAY_VALUES.fontSize;
    const fontColor = overlay.fontColor ?? DEFAULT_OVERLAY_VALUES.fontColor;
    const fontWeight = overlay.fontWeight ?? DEFAULT_OVERLAY_VALUES.fontWeight;

    // Calculate final opacity (dimmed if not in time range)
    const finalOpacity = shouldShow ? (isVisibleAtTime ? opacity : opacity * 0.3) : 0;

    // Don't render if hidden
    if (!shouldShow) return null;

    return (
        <View
            ref={viewRef}
            className="absolute"
            style={{
                left: overlay.x,
                top: overlay.y,
                opacity: finalOpacity,
                zIndex: (overlay.zIndex ?? 0) + 10, // Ensure overlays are above video
                transform: [
                    { rotate: `${rotation}deg` },
                    { scale: scale },
                ],
            }}
            {...(!overlay.locked ? panResponder.panHandlers : {})}
        >
            <Pressable
                onPress={handlePress}
                disabled={overlay.locked}
                style={{ flex: 1 }}
            >
                <View>
                    {overlay.type === "text" ? (
                        <View
                            className={`bg-black/70 rounded-lg px-3 py-2 ${
                                isSelected ? 'border-2 border-yellow-400' : 'border border-gray-600'
                            }`}
                            style={{
                                width,
                                height,
                                justifyContent: 'center',
                                alignItems: 'center',
                                minWidth: 50,
                                minHeight: 30,
                            }}
                        >
                            <Text
                                className="text-center"
                                style={{
                                    color: fontColor,
                                    fontSize,
                                    fontWeight: fontWeight === 'bold' ? 'bold' : 'normal',
                                }}
                                numberOfLines={5}
                                ellipsizeMode="tail"
                            >
                                {overlay.content || "Text"}
                            </Text>
                        </View>
                    ) : overlay.type === "image" ? (
                        <View
                            className={`rounded-lg overflow-hidden ${
                                isSelected ? 'border-2 border-yellow-400' : 'border border-gray-600'
                            }`}
                        >
                            <Image
                                source={{ uri: overlay.content }}
                                style={{ width, height }}
                                resizeMode="cover"
                            />
                        </View>
                    ) : overlay.type === "video" && overlay.content ? (
                        <View
                            className={`rounded-lg overflow-hidden ${
                                isSelected ? 'border-2 border-yellow-400' : 'border border-gray-600'
                            }`}
                        >
                            <VideoView
                                player={videoPlayer}
                                style={{ width, height }}
                                contentFit="cover"
                                nativeControls={false}
                            />
                        </View>
                    ) : (
                        <View
                            className={`bg-purple-600/80 rounded-lg justify-center items-center ${
                                isSelected ? 'border-2 border-yellow-400' : 'border border-gray-600'
                            }`}
                            style={{ width, height }}
                        >
                            <Text className="text-white font-bold text-sm">VIDEO</Text>
                            <Text className="text-white/80 text-xs">No clip</Text>
                        </View>
                    )}

                    {/* Time indicator */}
                    {!isVisibleAtTime && (
                        <View className="absolute top-0 left-0 bg-orange-500 rounded-br px-1">
                            <Text className="text-white text-xs">⏱</Text>
                        </View>
                    )}

                    {/* Locked indicator */}
                    {overlay.locked && (
                        <View className="absolute top-0 right-0 bg-lr-red rounded-bl px-1">
                            <Text className="text-white text-xs">🔒</Text>
                        </View>
                    )}

                    {/* Selection handles */}
                    {isSelected && !overlay.locked && (
                        <>
                            {/* Corner resize handles */}
                            <View className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full" />
                            <View className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
                            <View className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full" />
                            <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
                        </>
                    )}
                </View>
            </Pressable>
        </View>
    );
});
