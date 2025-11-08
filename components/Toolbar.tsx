import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

interface ToolbarProps {
  selectedCount: number;
  canUndo: boolean;
  canRedo: boolean;
  snapToGrid: boolean;
  zoom: number;
  onUndo: () => void;
  onRedo: () => void;
  onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute: (direction: 'horizontal' | 'vertical') => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onToggleSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export default function Toolbar({
  selectedCount,
  canUndo,
  canRedo,
  snapToGrid,
  zoom,
  onUndo,
  onRedo,
  onAlign,
  onDistribute,
  onDuplicate,
  onCopy,
  onPaste,
  onDelete,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: ToolbarProps) {
  const hasSelection = selectedCount > 0;
  const hasMultipleSelection = selectedCount > 1;

  return (
    <View className="bg-lr-panel rounded-lg p-3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-center gap-2">
          {/* Undo/Redo */}
          <ToolGroup>
            <ToolButton
              label="↶"
              tooltip="Undo"
              onPress={onUndo}
              disabled={!canUndo}
            />
            <ToolButton
              label="↷"
              tooltip="Redo"
              onPress={onRedo}
              disabled={!canRedo}
            />
          </ToolGroup>

          <Divider />

          {/* Clipboard */}
          <ToolGroup>
            <ToolButton
              label="⎘"
              tooltip="Copy"
              onPress={onCopy}
              disabled={!hasSelection}
            />
            <ToolButton
              label="⧉"
              tooltip="Paste"
              onPress={onPaste}
            />
            <ToolButton
              label="⎘⎘"
              tooltip="Duplicate"
              onPress={onDuplicate}
              disabled={!hasSelection}
            />
            <ToolButton
              label="✕"
              tooltip="Delete"
              onPress={onDelete}
              disabled={!hasSelection}
              danger
            />
          </ToolGroup>

          <Divider />

          {/* Alignment (requires 2+ overlays) */}
          <ToolGroup>
            <ToolButton
              label="⊣"
              tooltip="Align Left"
              onPress={() => onAlign('left')}
              disabled={!hasMultipleSelection}
            />
            <ToolButton
              label="⊢"
              tooltip="Align Center"
              onPress={() => onAlign('center')}
              disabled={!hasMultipleSelection}
            />
            <ToolButton
              label="⊢"
              tooltip="Align Right"
              onPress={() => onAlign('right')}
              disabled={!hasMultipleSelection}
            />
          </ToolGroup>

          <Divider />

          <ToolGroup>
            <ToolButton
              label="⊤"
              tooltip="Align Top"
              onPress={() => onAlign('top')}
              disabled={!hasMultipleSelection}
            />
            <ToolButton
              label="="
              tooltip="Align Middle"
              onPress={() => onAlign('middle')}
              disabled={!hasMultipleSelection}
            />
            <ToolButton
              label="⊥"
              tooltip="Align Bottom"
              onPress={() => onAlign('bottom')}
              disabled={!hasMultipleSelection}
            />
          </ToolGroup>

          <Divider />

          {/* Distribution (requires 3+ overlays) */}
          <ToolGroup>
            <ToolButton
              label="⟷"
              tooltip="Distribute Horizontally"
              onPress={() => onDistribute('horizontal')}
              disabled={selectedCount < 3}
            />
            <ToolButton
              label="⟷"
              tooltip="Distribute Vertically"
              onPress={() => onDistribute('vertical')}
              disabled={selectedCount < 3}
              rotated
            />
          </ToolGroup>

          <Divider />

          {/* Zoom */}
          <ToolGroup>
            <ToolButton label="−" tooltip="Zoom Out" onPress={onZoomOut} />
            <Pressable onPress={onZoomReset} className="px-3 py-1">
              <Text className="text-lr-text-secondary text-xs">
                {(zoom * 100).toFixed(0)}%
              </Text>
            </Pressable>
            <ToolButton label="+" tooltip="Zoom In" onPress={onZoomIn} />
          </ToolGroup>

          <Divider />

          {/* Snap to Grid */}
          <ToolGroup>
            <ToolButton
              label="⊞"
              tooltip={snapToGrid ? 'Snap: ON' : 'Snap: OFF'}
              onPress={onToggleSnap}
              active={snapToGrid}
            />
          </ToolGroup>
        </View>
      </ScrollView>
    </View>
  );
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <View className="flex-row gap-1">{children}</View>;
}

function Divider() {
  return <View className="w-px bg-lr-border h-8 mx-1" />;
}

interface ToolButtonProps {
  label: string;
  tooltip?: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
  rotated?: boolean;
}

function ToolButton({
  label,
  tooltip,
  onPress,
  disabled = false,
  active = false,
  danger = false,
  rotated = false,
}: ToolButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`
        px-3 py-2 rounded
        ${disabled ? 'bg-lr-dark opacity-40' : active ? 'bg-lr-blue' : 'bg-lr-dark'}
        ${!disabled && 'active:bg-lr-darker'}
      `}
      style={({ pressed }) => ({
        opacity: pressed && !disabled ? 0.7 : 1,
      })}
    >
      <Text
        className={`
          text-base font-bold
          ${disabled ? 'text-lr-text-tertiary' : danger ? 'text-lr-red' : 'text-lr-text-primary'}
        `}
        style={rotated ? { transform: [{ rotate: '90deg' }] } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  );
}
