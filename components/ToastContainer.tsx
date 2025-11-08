import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { ToastMessage } from '../types/types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <View className="absolute top-16 left-0 right-0 z-50 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto fade out before removal
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, toast.duration - 200);
    }
  }, []);

  const bgColor = {
    success: 'bg-lr-green',
    error: 'bg-lr-red',
    warning: 'bg-yellow-600',
    info: 'bg-lr-blue',
  }[toast.type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[toast.type];

  return (
    <Animated.View
      style={{ opacity }}
      className="mb-2 pointer-events-auto"
    >
      <View className={`${bgColor} rounded-lg shadow-lg flex-row items-center p-4`}>
        <Text className="text-white text-xl mr-3">{icon}</Text>
        <Text className="text-white flex-1 font-medium">{toast.message}</Text>
        <Pressable
          onPress={() => onDismiss(toast.id)}
          className="ml-3 p-1"
        >
          <Text className="text-white text-lg">✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
