import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Overlay } from '../types/types';

interface PropertyPanelProps {
  selectedOverlays: Overlay[];
  onUpdate: (id: string, updates: Partial<Overlay>) => void;
  onClose?: () => void;
}

export default function PropertyPanel({
  selectedOverlays,
  onUpdate,
  onClose,
}: PropertyPanelProps) {
  const overlay = selectedOverlays[0]; // For now, edit first selected

  if (!overlay) {
    return (
      <View className="bg-lr-panel rounded-lg p-4">
        <Text className="text-lr-text-secondary text-center">
          Select an overlay to edit properties
        </Text>
      </View>
    );
  }

  const updateProperty = useCallback((key: string, value: any) => {
    onUpdate(overlay.id, { [key]: value });
  }, [overlay.id, onUpdate]);

  return (
    <View className="bg-lr-panel rounded-lg p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lr-text-primary font-bold text-lg">Properties</Text>
        {onClose && (
          <Pressable onPress={onClose}>
            <Text className="text-lr-text-secondary">✕</Text>
          </Pressable>
        )}
      </View>

      <ScrollView className="max-h-96">
        {/* Position & Size */}
        <PropertySection title="Position & Size">
          <PropertyRow label="X">
            <PropertyInput
              value={overlay.x.toString()}
              onChangeText={(val) => updateProperty('x', parseFloat(val) || 0)}
              keyboardType="numeric"
            />
          </PropertyRow>
          <PropertyRow label="Y">
            <PropertyInput
              value={overlay.y.toString()}
              onChangeText={(val) => updateProperty('y', parseFloat(val) || 0)}
              keyboardType="numeric"
            />
          </PropertyRow>
          <PropertyRow label="Width">
            <PropertyInput
              value={(overlay.width || 200).toString()}
              onChangeText={(val) => updateProperty('width', parseFloat(val) || 200)}
              keyboardType="numeric"
            />
          </PropertyRow>
          <PropertyRow label="Height">
            <PropertyInput
              value={(overlay.height || 100).toString()}
              onChangeText={(val) => updateProperty('height', parseFloat(val) || 100)}
              keyboardType="numeric"
            />
          </PropertyRow>
        </PropertySection>

        {/* Transform */}
        <PropertySection title="Transform">
          <PropertyRow label="Opacity">
            <PropertyInput
              value={((overlay.opacity || 1) * 100).toFixed(0)}
              onChangeText={(val) => updateProperty('opacity', (parseFloat(val) || 100) / 100)}
              keyboardType="numeric"
              suffix="%"
            />
          </PropertyRow>
          <PropertyRow label="Rotation">
            <PropertyInput
              value={(overlay.rotation || 0).toString()}
              onChangeText={(val) => updateProperty('rotation', parseFloat(val) || 0)}
              keyboardType="numeric"
              suffix="°"
            />
          </PropertyRow>
          <PropertyRow label="Scale">
            <PropertyInput
              value={(overlay.scale || 1).toString()}
              onChangeText={(val) => updateProperty('scale', parseFloat(val) || 1)}
              keyboardType="numeric"
              suffix="x"
            />
          </PropertyRow>
          <PropertyRow label="Z-Index">
            <PropertyInput
              value={(overlay.zIndex || 0).toString()}
              onChangeText={(val) => updateProperty('zIndex', parseInt(val) || 0)}
              keyboardType="numeric"
            />
          </PropertyRow>
        </PropertySection>

        {/* Timing */}
        <PropertySection title="Timing">
          <PropertyRow label="Start Time">
            <PropertyInput
              value={overlay.start_time.toFixed(1)}
              onChangeText={(val) => updateProperty('start_time', parseFloat(val) || 0)}
              keyboardType="numeric"
              suffix="s"
            />
          </PropertyRow>
          <PropertyRow label="End Time">
            <PropertyInput
              value={overlay.end_time.toFixed(1)}
              onChangeText={(val) => updateProperty('end_time', parseFloat(val) || 0)}
              keyboardType="numeric"
              suffix="s"
            />
          </PropertyRow>
        </PropertySection>

        {/* Text Properties (if text overlay) */}
        {overlay.type === 'text' && (
          <PropertySection title="Text">
            <PropertyRow label="Font Size">
              <PropertyInput
                value={(overlay.fontSize || 24).toString()}
                onChangeText={(val) => updateProperty('fontSize', parseInt(val) || 24)}
                keyboardType="numeric"
                suffix="px"
              />
            </PropertyRow>
            <PropertyRow label="Color">
              <PropertyInput
                value={overlay.fontColor || '#FFFFFF'}
                onChangeText={(val) => updateProperty('fontColor', val)}
                placeholder="#FFFFFF"
              />
            </PropertyRow>
            <PropertyRow label="Weight">
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => updateProperty('fontWeight', 'normal')}
                  className={`flex-1 p-2 rounded ${
                    (overlay.fontWeight || 'normal') === 'normal'
                      ? 'bg-lr-blue'
                      : 'bg-lr-dark'
                  }`}
                >
                  <Text className="text-white text-center text-sm">Normal</Text>
                </Pressable>
                <Pressable
                  onPress={() => updateProperty('fontWeight', 'bold')}
                  className={`flex-1 p-2 rounded ${
                    overlay.fontWeight === 'bold' ? 'bg-lr-blue' : 'bg-lr-dark'
                  }`}
                >
                  <Text className="text-white text-center text-sm font-bold">Bold</Text>
                </Pressable>
              </View>
            </PropertyRow>
          </PropertySection>
        )}

        {/* Visibility */}
        <PropertySection title="Visibility">
          <PropertyRow label="Visible">
            <Pressable
              onPress={() => updateProperty('visible', !(overlay.visible ?? true))}
              className={`px-4 py-2 rounded ${
                (overlay.visible ?? true) ? 'bg-lr-green' : 'bg-lr-red'
              }`}
            >
              <Text className="text-white font-medium">
                {(overlay.visible ?? true) ? 'Shown' : 'Hidden'}
              </Text>
            </Pressable>
          </PropertyRow>
          <PropertyRow label="Locked">
            <Pressable
              onPress={() => updateProperty('locked', !overlay.locked)}
              className={`px-4 py-2 rounded ${
                overlay.locked ? 'bg-lr-red' : 'bg-lr-dark'
              }`}
            >
              <Text className="text-white font-medium">
                {overlay.locked ? 'Locked' : 'Unlocked'}
              </Text>
            </Pressable>
          </PropertyRow>
        </PropertySection>
      </ScrollView>
    </View>
  );
}

// Helper components
function PropertySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="text-lr-text-secondary text-xs font-semibold uppercase mb-2">
        {title}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row justify-between items-center py-1">
      <Text className="text-lr-text-primary text-sm flex-shrink-0 w-24">{label}</Text>
      <View className="flex-1">{children}</View>
    </View>
  );
}

function PropertyInput({
  value,
  onChangeText,
  keyboardType = 'default',
  suffix,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        className="flex-1 bg-lr-dark text-lr-text-primary px-3 py-2 rounded border border-lr-border"
      />
      {suffix && <Text className="text-lr-text-tertiary text-sm">{suffix}</Text>}
    </View>
  );
}
