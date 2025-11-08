import { Overlay } from '../types/types';

// Default overlay values
export const DEFAULT_OVERLAY_VALUES = {
  opacity: 1,
  rotation: 0,
  scale: 1,
  zIndex: 0,
  fontSize: 24,
  fontColor: '#FFFFFF',
  fontFamily: 'system',
  textAlign: 'left' as const,
  fontWeight: 'normal' as const,
  locked: false,
  visible: true,
  width: 200,
  height: 100,
};

// Create a new overlay with defaults
export function createOverlay(
  type: 'text' | 'image' | 'video',
  content: string,
  x: number,
  y: number,
  start_time: number,
  end_time: number,
  additionalProps?: Partial<Overlay>
): Overlay {
  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    content,
    x,
    y,
    start_time,
    end_time,
    ...DEFAULT_OVERLAY_VALUES,
    ...additionalProps,
  };
}

// Snap position to grid
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

// Constrain position within bounds
export function constrainPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(x, containerWidth - width)),
    y: Math.max(0, Math.min(y, containerHeight - height)),
  };
}

// Check if overlay is visible at current time
export function isOverlayVisibleAtTime(overlay: Overlay, currentTime: number): boolean {
  return (
    overlay.visible !== false &&
    currentTime >= overlay.start_time &&
    currentTime <= overlay.end_time
  );
}

// Sort overlays by z-index
export function sortOverlaysByZIndex(overlays: Overlay[]): Overlay[] {
  return [...overlays].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
}

// Get overlay bounds
export function getOverlayBounds(overlay: Overlay): {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
} {
  const width = overlay.width || DEFAULT_OVERLAY_VALUES.width;
  const height = overlay.height || DEFAULT_OVERLAY_VALUES.height;

  return {
    left: overlay.x,
    top: overlay.y,
    right: overlay.x + width,
    bottom: overlay.y + height,
    width,
    height,
  };
}

// Check if two overlays overlap
export function overlaysIntersect(overlay1: Overlay, overlay2: Overlay): boolean {
  const bounds1 = getOverlayBounds(overlay1);
  const bounds2 = getOverlayBounds(overlay2);

  return !(
    bounds1.right < bounds2.left ||
    bounds1.left > bounds2.right ||
    bounds1.bottom < bounds2.top ||
    bounds1.top > bounds2.bottom
  );
}

// Align overlays
export function alignOverlays(
  overlays: Overlay[],
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): Overlay[] {
  if (overlays.length === 0) return overlays;

  const bounds = overlays.map(getOverlayBounds);

  switch (alignment) {
    case 'left': {
      const minLeft = Math.min(...bounds.map(b => b.left));
      return overlays.map((overlay) => ({
        ...overlay,
        x: minLeft,
      }));
    }
    case 'center': {
      const avgCenter = bounds.reduce((sum, b) => sum + (b.left + b.width / 2), 0) / bounds.length;
      return overlays.map((overlay, i) => ({
        ...overlay,
        x: avgCenter - bounds[i].width / 2,
      }));
    }
    case 'right': {
      const maxRight = Math.max(...bounds.map(b => b.right));
      return overlays.map((overlay, i) => ({
        ...overlay,
        x: maxRight - bounds[i].width,
      }));
    }
    case 'top': {
      const minTop = Math.min(...bounds.map(b => b.top));
      return overlays.map((overlay) => ({
        ...overlay,
        y: minTop,
      }));
    }
    case 'middle': {
      const avgMiddle = bounds.reduce((sum, b) => sum + (b.top + b.height / 2), 0) / bounds.length;
      return overlays.map((overlay, i) => ({
        ...overlay,
        y: avgMiddle - bounds[i].height / 2,
      }));
    }
    case 'bottom': {
      const maxBottom = Math.max(...bounds.map(b => b.bottom));
      return overlays.map((overlay, i) => ({
        ...overlay,
        y: maxBottom - bounds[i].height,
      }));
    }
    default:
      return overlays;
  }
}

// Distribute overlays evenly
export function distributeOverlays(
  overlays: Overlay[],
  direction: 'horizontal' | 'vertical'
): Overlay[] {
  if (overlays.length < 3) return overlays;

  const bounds = overlays.map(getOverlayBounds);
  const sorted = [...overlays].sort((a, b) => {
    if (direction === 'horizontal') {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  const sortedBounds = sorted.map(getOverlayBounds);

  if (direction === 'horizontal') {
    const totalSpace = sortedBounds[sortedBounds.length - 1].right - sortedBounds[0].left;
    const totalWidth = sortedBounds.reduce((sum, b) => sum + b.width, 0);
    const spacing = (totalSpace - totalWidth) / (sorted.length - 1);

    let currentX = sortedBounds[0].left;
    return sorted.map((overlay, i) => {
      const result = { ...overlay, x: currentX };
      currentX += sortedBounds[i].width + spacing;
      return result;
    });
  } else {
    const totalSpace = sortedBounds[sortedBounds.length - 1].bottom - sortedBounds[0].top;
    const totalHeight = sortedBounds.reduce((sum, b) => sum + b.height, 0);
    const spacing = (totalSpace - totalHeight) / (sorted.length - 1);

    let currentY = sortedBounds[0].top;
    return sorted.map((overlay, i) => {
      const result = { ...overlay, y: currentY };
      currentY += sortedBounds[i].height + spacing;
      return result;
    });
  }
}

// Format time for display (MM:SS)
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Parse time string to seconds
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}
