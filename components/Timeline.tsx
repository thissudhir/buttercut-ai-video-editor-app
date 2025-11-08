import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { Overlay } from '../types/types';
import { formatTime } from '../utils/overlayUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_WIDTH = SCREEN_WIDTH - 64; // Account for padding

interface TimelineProps {
  duration: number;
  currentTime: number;
  overlays: Overlay[];
  onSeek: (time: number) => void;
  onOverlaySelect: (id: string) => void;
  selectedOverlayIds: string[];
  zoom?: number;
}

export default function Timeline({
  duration,
  currentTime,
  overlays,
  onSeek,
  onOverlaySelect,
  selectedOverlayIds,
  zoom = 1,
}: TimelineProps) {
  // Calculate timeline dimensions
  const timelineWidthScaled = Math.max(TIMELINE_WIDTH * zoom, TIMELINE_WIDTH);
  const pixelsPerSecond = timelineWidthScaled / Math.max(duration, 1);

  // Time markers (every 5 seconds, or 1 second if zoomed in)
  const markerInterval = zoom > 2 ? 1 : zoom > 1 ? 2 : 5;
  const markers = useMemo(() => {
    const result = [];
    for (let i = 0; i <= duration; i += markerInterval) {
      result.push(i);
    }
    if (result[result.length - 1] < duration) {
      result.push(duration);
    }
    return result;
  }, [duration, markerInterval]);

  // Handle seek by clicking timeline
  const handlePress = useCallback((event: any) => {
    const { locationX } = event.nativeEvent;
    const time = (locationX / timelineWidthScaled) * duration;
    const clampedTime = Math.max(0, Math.min(duration, time));
    onSeek(clampedTime);
  }, [timelineWidthScaled, duration, onSeek]);

  // Current time position
  const playheadPosition = (currentTime / Math.max(duration, 1)) * timelineWidthScaled;

  // Sort overlays by track (to prevent overlapping visually)
  const tracksData = useMemo(() => {
    const tracks: Overlay[][] = [];
    const sortedOverlays = [...overlays].sort((a, b) => a.start_time - b.start_time);

    sortedOverlays.forEach((overlay) => {
      // Find a track where this overlay fits
      let placed = false;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const lastInTrack = track[track.length - 1];
        if (lastInTrack.end_time <= overlay.start_time) {
          track.push(overlay);
          placed = true;
          break;
        }
      }
      if (!placed) {
        tracks.push([overlay]);
      }
    });

    return tracks;
  }, [overlays]);

  return (
    <View className="bg-lr-panel rounded-lg p-4">
      {/* Timeline header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lr-text-primary font-semibold">Timeline</Text>
        <Text className="text-lr-text-secondary text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>

      {/* Timeline ruler and tracks */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        className="border border-lr-border rounded-lg"
        style={{ height: Math.max(120, tracksData.length * 32 + 40) }}
      >
        <Pressable
          onPress={handlePress}
          style={{ width: timelineWidthScaled, minWidth: TIMELINE_WIDTH }}
        >
          {/* Ruler */}
          <View className="h-10 bg-lr-dark rounded-t relative border-b border-lr-border">
            {markers.map((time) => {
              const position = (time / Math.max(duration, 1)) * timelineWidthScaled;
              return (
                <View
                  key={`marker-${time}`}
                  style={{ position: 'absolute', left: position, top: 0, bottom: 0 }}
                  className="items-start justify-start"
                >
                  <View className="w-px h-3 bg-lr-text-tertiary" />
                  <Text className="text-xs text-lr-text-tertiary ml-1 mt-0.5">
                    {formatTime(time)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Overlay tracks */}
          <View className="relative bg-lr-darker flex-1">
            {tracksData.map((track, trackIndex) => (
              <View
                key={`track-${trackIndex}`}
                className="relative h-8 border-b border-lr-border/30"
              >
                {track.map((overlay) => {
                  const startPosition = (overlay.start_time / Math.max(duration, 1)) * timelineWidthScaled;
                  const overlayWidth = Math.max(
                    ((overlay.end_time - overlay.start_time) / Math.max(duration, 1)) * timelineWidthScaled,
                    30
                  );
                  const isSelected = selectedOverlayIds.includes(overlay.id);

                  const bgColor =
                    overlay.type === 'text'
                      ? isSelected ? 'bg-blue-600' : 'bg-lr-blue'
                      : overlay.type === 'image'
                      ? isSelected ? 'bg-teal-600' : 'bg-lr-teal'
                      : isSelected ? 'bg-purple-600' : 'bg-lr-purple';

                  return (
                    <Pressable
                      key={overlay.id}
                      onPress={() => onOverlaySelect(overlay.id)}
                      style={{
                        position: 'absolute',
                        left: startPosition,
                        width: overlayWidth,
                        top: 2,
                        height: 28,
                      }}
                      className={`${bgColor} rounded px-2 ${
                        isSelected ? 'opacity-100 border-2 border-yellow-400' : 'opacity-90'
                      }`}
                    >
                      <Text
                        numberOfLines={1}
                        className="text-xs text-white font-medium"
                        style={{ lineHeight: 24 }}
                      >
                        {overlay.type === 'text'
                          ? overlay.content.substring(0, 20)
                          : `${overlay.type.charAt(0).toUpperCase()}${overlay.type.slice(1)}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Playhead */}
          <View
            style={{
              position: 'absolute',
              left: Math.max(0, playheadPosition - 1),
              top: 0,
              bottom: 0,
              width: 2,
            }}
            className="bg-red-500 z-10"
            pointerEvents="none"
          >
            <View className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1" />
            <View className="absolute bottom-0 w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mb-1" />
          </View>
        </Pressable>
      </ScrollView>

      {/* Zoom info */}
      {zoom !== 1 && (
        <View className="flex-row items-center justify-center mt-2">
          <Text className="text-lr-text-tertiary text-xs">
            Zoom: {zoom.toFixed(1)}x
          </Text>
        </View>
      )}
    </View>
  );
}
