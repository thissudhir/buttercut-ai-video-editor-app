import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer } from 'expo-video';
import { useEditor } from '../contexts/EditorContext';
import { useVideoAPI } from '../hooks/useVideoAPI';
import { useToast } from '../hooks/useToast';
import { createOverlay, alignOverlays, distributeOverlays } from '../utils/overlayUtils';
import VideoPreview from './VideoPreview';
import Timeline from './Timeline';
import PropertyPanel from './PropertyPanel';
import Toolbar from './Toolbar';
import ToastContainer from './ToastContainer';
import { OverlayControls } from './OverlayControls';
import { TextInputField } from './TextInputField';
import { ActionButton } from './ActionButton';
import { JobStatus } from './JobStatus';

export default function EditorScreen() {
    const {
        state,
        setVideo,
        addOverlay,
        updateOverlay,
        deleteOverlay,
        deleteSelectedOverlays,
        selectOverlay,
        deselectAll,
        setCurrentTime,
        setPlaying,
        setZoom,
        toggleSnapToGrid,
        undo,
        redo,
        duplicateOverlay,
        copyOverlays,
        pasteOverlays,
    } = useEditor();

    const { uploadVideo, getJobStatus, getResultUrl, isUploading } = useVideoAPI();
    const { toasts, showToast, hideToast, success, error } = useToast();

    const [textValue, setTextValue] = useState('');
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [showPropertyPanel, setShowPropertyPanel] = useState(false);

    // Create video player
    const player = useVideoPlayer(state.videoUri || '', (player) => {
        player.pause();
    });

    // Sync current time from player
    useEffect(() => {
        if (!player) return;

        const interval = setInterval(() => {
            try {
                const time = player.currentTime || 0;
                setCurrentTime(time);
            } catch (e) {
                // Player not ready
            }
        }, 100);

        return () => clearInterval(interval);
    }, [player, setCurrentTime]);

    // Video selection
    const pickVideo = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
            });

            if (result.canceled) return;

            const videoUri = result.assets[0].uri;
            setVideo(videoUri, 60); // Default duration, will be updated by player
            success('Video loaded successfully');

            // Get actual duration once player is ready
            setTimeout(() => {
                try {
                    if (player && player.duration) {
                        setVideo(videoUri, player.duration);
                    }
                } catch (e) {
                    // Player not ready yet
                }
            }, 1000);
        } catch (err: any) {
            error('Failed to load video: ' + err.message);
        }
    }, [setVideo, player, success, error]);

    // Add text overlay
    const addTextOverlay = useCallback(() => {
        if (!textValue.trim()) {
            error('Please enter some text');
            return;
        }

        const overlay = createOverlay(
            'text',
            textValue,
            50,
            50,
            state.currentTime,
            Math.min(state.currentTime + 3, state.videoDuration)
        );

        addOverlay(overlay);
        setTextValue('');
        success('Text overlay added');
    }, [textValue, state.currentTime, state.videoDuration, addOverlay, success, error]);

    // Add image overlay
    const addImageOverlay = useCallback(async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images' as any,
                quality: 1,
            });

            if (result.canceled) return;

            const overlay = createOverlay(
                'image',
                result.assets[0].uri,
                50,
                50,
                state.currentTime,
                Math.min(state.currentTime + 5, state.videoDuration)
            );

            addOverlay(overlay);
            success('Image overlay added');
        } catch (err: any) {
            error('Failed to add image: ' + err.message);
        }
    }, [state.currentTime, state.videoDuration, addOverlay, success, error]);

    // Add video overlay
    const addVideoOverlay = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
            });

            if (result.canceled) return;

            const overlay = createOverlay(
                'video',
                result.assets[0].uri,
                50,
                50,
                state.currentTime,
                Math.min(state.currentTime + 5, state.videoDuration)
            );

            addOverlay(overlay);
            success('Video overlay added');
        } catch (err: any) {
            error('Failed to add video: ' + err.message);
        }
    }, [state.currentTime, state.videoDuration, addOverlay, success, error]);

    // Toolbar actions
    const handleAlign = useCallback((alignment: any) => {
        if (state.selectedOverlayIds.length < 2) return;

        const selectedOverlays = state.overlays.filter(o =>
            state.selectedOverlayIds.includes(o.id)
        );

        const aligned = alignOverlays(selectedOverlays, alignment);

        aligned.forEach((overlay) => {
            updateOverlay({ id: overlay.id, x: overlay.x, y: overlay.y });
        });

        success(`Aligned ${alignment}`);
    }, [state.overlays, state.selectedOverlayIds, updateOverlay, success]);

    const handleDistribute = useCallback((direction: 'horizontal' | 'vertical') => {
        if (state.selectedOverlayIds.length < 3) return;

        const selectedOverlays = state.overlays.filter(o =>
            state.selectedOverlayIds.includes(o.id)
        );

        const distributed = distributeOverlays(selectedOverlays, direction);

        distributed.forEach((overlay) => {
            updateOverlay({ id: overlay.id, x: overlay.x, y: overlay.y });
        });

        success(`Distributed ${direction}ly`);
    }, [state.overlays, state.selectedOverlayIds, updateOverlay, success]);

    const handleDuplicate = useCallback(() => {
        if (state.selectedOverlayIds.length === 0) return;

        state.selectedOverlayIds.forEach((id) => {
            duplicateOverlay(id);
        });

        success('Overlay duplicated');
    }, [state.selectedOverlayIds, duplicateOverlay, success]);

    const handleCopy = useCallback(() => {
        if (state.selectedOverlayIds.length === 0) return;

        copyOverlays(state.selectedOverlayIds);
        success(`Copied ${state.selectedOverlayIds.length} overlay(s)`);
    }, [state.selectedOverlayIds, copyOverlays, success]);

    const handlePaste = useCallback(() => {
        pasteOverlays();
        success('Overlays pasted');
    }, [pasteOverlays, success]);

    const handleDelete = useCallback(() => {
        if (state.selectedOverlayIds.length === 0) return;

        deleteSelectedOverlays();
        success('Overlays deleted');
    }, [state.selectedOverlayIds, deleteSelectedOverlays, success]);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        setZoom(state.zoom + 0.25);
    }, [state.zoom, setZoom]);

    const handleZoomOut = useCallback(() => {
        setZoom(state.zoom - 0.25);
    }, [state.zoom, setZoom]);

    const handleZoomReset = useCallback(() => {
        setZoom(1);
    }, [setZoom]);

    // Submit to backend
    const submitToBackend = useCallback(async () => {
        if (!state.videoUri) {
            error('Please select a video first');
            return;
        }

        if (state.overlays.length === 0) {
            error('Please add at least one overlay');
            return;
        }

        try {
            // Prepare overlay files
            const overlayFiles: { [key: number]: string } = {};
            state.overlays.forEach((overlay, index) => {
                if (overlay.type === 'image' || overlay.type === 'video') {
                    overlayFiles[index] = overlay.content;
                }
            });

            const response = await uploadVideo(state.videoUri, state.overlays, overlayFiles);

            if (response) {
                setCurrentJobId(response.job_id);
                success('Video submitted for processing');
            } else {
                error('Failed to upload video');
            }
        } catch (err: any) {
            error('Upload failed: ' + err.message);
        }
    }, [state.videoUri, state.overlays, uploadVideo, success, error]);

    // Get selected overlays for property panel
    const selectedOverlays = state.overlays.filter(o =>
        state.selectedOverlayIds.includes(o.id)
    );

    return (
        <View className="flex-1 bg-lr-darker">
            <ScrollView className="flex-1 px-4 py-6">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lr-text-primary text-2xl font-bold">
                        Buttercut.ai Editor
                    </Text>
                    {state.overlays.length > 0 && (
                        <Pressable
                            onPress={() => setShowPropertyPanel(!showPropertyPanel)}
                            className="bg-lr-panel px-3 py-1 rounded"
                        >
                            <Text className="text-lr-text-secondary text-xs">
                                {showPropertyPanel ? 'Hide' : 'Show'} Properties
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Video Selection */}
                {!state.videoUri && (
                    <ActionButton
                        title="📹 Select Video"
                        onPress={pickVideo}
                        variant="secondary"
                    />
                )}

                {/* Video Preview */}
                {state.videoUri && (
                    <>
                        <VideoPreview
                            videoUri={state.videoUri}
                            player={player}
                            overlays={state.overlays}
                            selectedOverlayIds={state.selectedOverlayIds}
                            currentTime={state.currentTime}
                            zoom={state.zoom}
                            snapToGrid={state.snapToGrid}
                            gridSize={state.gridSize}
                            onOverlayDragEnd={updateOverlay}
                            onOverlaySelect={selectOverlay}
                            onTogglePlay={() => setPlaying(!state.isPlaying)}
                        />

                        {/* Toolbar */}
                        <Toolbar
                            selectedCount={state.selectedOverlayIds.length}
                            canUndo={state.undoStack.length > 0}
                            canRedo={state.redoStack.length > 0}
                            snapToGrid={state.snapToGrid}
                            zoom={state.zoom}
                            onUndo={undo}
                            onRedo={redo}
                            onAlign={handleAlign}
                            onDistribute={handleDistribute}
                            onDuplicate={handleDuplicate}
                            onCopy={handleCopy}
                            onPaste={handlePaste}
                            onDelete={handleDelete}
                            onToggleSnap={toggleSnapToGrid}
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            onZoomReset={handleZoomReset}
                        />

                        {/* Timeline */}
                        <View className="mt-4">
                            <Timeline
                                duration={state.videoDuration}
                                currentTime={state.currentTime}
                                overlays={state.overlays}
                                onSeek={setCurrentTime}
                                onOverlaySelect={(id) => selectOverlay(id, false)}
                                selectedOverlayIds={state.selectedOverlayIds}
                                zoom={1}
                            />
                        </View>

                        {/* Add Overlay Controls */}
                        <View className="mt-4">
                            <Text className="text-lr-text-primary font-semibold mb-2">
                                Add Overlay
                            </Text>
                            <TextInputField
                                value={textValue}
                                onChangeText={setTextValue}
                            />
                            <OverlayControls
                                onAddText={addTextOverlay}
                                onAddImage={addImageOverlay}
                                onAddClip={addVideoOverlay}
                            />
                        </View>

                        {/* Property Panel */}
                        {showPropertyPanel && selectedOverlays.length > 0 && (
                            <View className="mt-4">
                                <PropertyPanel
                                    selectedOverlays={selectedOverlays}
                                    onUpdate={(id, updates) => updateOverlay({ id, ...updates })}
                                    onClose={() => setShowPropertyPanel(false)}
                                />
                            </View>
                        )}

                        {/* Export Button */}
                        <View className="mt-6">
                            <ActionButton
                                title={isUploading ? '⏳ Uploading...' : '🚀 Export Video'}
                                onPress={submitToBackend}
                                variant="primary"
                                disabled={isUploading || state.overlays.length === 0}
                            />
                        </View>
                    </>
                )}

                {/* Info */}
                <View className="mt-4 p-4 bg-lr-panel rounded-lg">
                    <Text className="text-lr-text-secondary text-xs">
                        💡 Tip: Select multiple overlays to align and distribute them.
                        Use undo/redo for non-destructive editing.
                    </Text>
                </View>
            </ScrollView>

            {/* Job Status Modal */}
            {currentJobId && (
                <JobStatus
                    jobId={currentJobId}
                    onClose={() => setCurrentJobId(null)}
                />
            )}

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onDismiss={hideToast} />
        </View>
    );
}
