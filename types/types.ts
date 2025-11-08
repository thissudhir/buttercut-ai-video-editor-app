// Core Overlay Interface with Professional Properties
export interface Overlay {
  id: string;
  type: "text" | "image" | "video";
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  start_time: number;
  end_time: number;

  // Professional editing properties
  opacity?: number;        // 0-1, default 1
  rotation?: number;       // degrees, default 0
  scale?: number;          // multiplier, default 1
  zIndex?: number;         // layer order, default 0

  // Text-specific properties
  fontSize?: number;       // default 24
  fontColor?: string;      // hex color, default "#FFFFFF"
  fontFamily?: string;     // font name, default "system"
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";

  // Advanced properties
  locked?: boolean;        // prevent editing/moving
  visible?: boolean;       // show/hide overlay
}

// Partial overlay for updates
export type OverlayUpdate = Partial<Overlay> & { id: string };

// Video project structure
export interface VideoProject {
  id: string;
  name: string;
  videoUri: string;
  videoDuration: number;
  overlays: Overlay[];
  createdAt: number;
  updatedAt: number;
  thumbnailUri?: string;
}

// Editor state
export interface EditorState {
  videoUri: string | null;
  videoDuration: number;
  overlays: Overlay[];
  selectedOverlayIds: string[];
  currentTime: number;
  isPlaying: boolean;
  zoom: number;
  snapToGrid: boolean;
  gridSize: number;
  undoStack: Overlay[][];
  redoStack: Overlay[][];
}

// Job status from backend
export interface JobStatus {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  created_at?: string;
  completed_at?: string;
}

// Upload response
export interface UploadResponse {
  job_id: string;
  message: string;
}

// Toast notification
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

// Timeline markers
export interface TimelineMarker {
  id: string;
  time: number;
  label: string;
  color?: string;
}

// Clipboard for copy/paste
export interface ClipboardData {
  overlays: Overlay[];
  timestamp: number;
}
