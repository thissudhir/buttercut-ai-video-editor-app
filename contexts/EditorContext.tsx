import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Overlay, EditorState, OverlayUpdate, ClipboardData } from '../types/types';

// Action types
type EditorAction =
  | { type: 'SET_VIDEO'; payload: { uri: string; duration: number } }
  | { type: 'ADD_OVERLAY'; payload: Overlay }
  | { type: 'UPDATE_OVERLAY'; payload: OverlayUpdate }
  | { type: 'DELETE_OVERLAY'; payload: string }
  | { type: 'DELETE_SELECTED_OVERLAYS' }
  | { type: 'SELECT_OVERLAY'; payload: { id: string; multiSelect?: boolean } }
  | { type: 'DESELECT_ALL' }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'TOGGLE_SNAP_TO_GRID' }
  | { type: 'SET_GRID_SIZE'; payload: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_STATE_TO_HISTORY' }
  | { type: 'DUPLICATE_OVERLAY'; payload: string }
  | { type: 'COPY_OVERLAYS'; payload: string[] }
  | { type: 'PASTE_OVERLAYS' }
  | { type: 'RESET_PROJECT' };

// Initial state
const initialState: EditorState = {
  videoUri: null,
  videoDuration: 0,
  overlays: [],
  selectedOverlayIds: [],
  currentTime: 0,
  isPlaying: false,
  zoom: 1,
  snapToGrid: false,
  gridSize: 10,
  undoStack: [],
  redoStack: [],
};

// Clipboard storage
let clipboard: ClipboardData | null = null;

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_VIDEO':
      return {
        ...initialState,
        videoUri: action.payload.uri,
        videoDuration: action.payload.duration,
      };

    case 'ADD_OVERLAY':
      return {
        ...state,
        overlays: [...state.overlays, action.payload],
      };

    case 'UPDATE_OVERLAY':
      return {
        ...state,
        overlays: state.overlays.map(overlay =>
          overlay.id === action.payload.id
            ? { ...overlay, ...action.payload }
            : overlay
        ),
      };

    case 'DELETE_OVERLAY':
      return {
        ...state,
        overlays: state.overlays.filter(o => o.id !== action.payload),
        selectedOverlayIds: state.selectedOverlayIds.filter(id => id !== action.payload),
      };

    case 'DELETE_SELECTED_OVERLAYS':
      return {
        ...state,
        overlays: state.overlays.filter(o => !state.selectedOverlayIds.includes(o.id)),
        selectedOverlayIds: [],
      };

    case 'SELECT_OVERLAY': {
      const { id, multiSelect } = action.payload;
      if (multiSelect) {
        const isSelected = state.selectedOverlayIds.includes(id);
        return {
          ...state,
          selectedOverlayIds: isSelected
            ? state.selectedOverlayIds.filter(selectedId => selectedId !== id)
            : [...state.selectedOverlayIds, id],
        };
      }
      return {
        ...state,
        selectedOverlayIds: [id],
      };
    }

    case 'DESELECT_ALL':
      return {
        ...state,
        selectedOverlayIds: [],
      };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };

    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload,
      };

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(0.25, Math.min(4, action.payload)),
      };

    case 'TOGGLE_SNAP_TO_GRID':
      return {
        ...state,
        snapToGrid: !state.snapToGrid,
      };

    case 'SET_GRID_SIZE':
      return {
        ...state,
        gridSize: action.payload,
      };

    case 'SAVE_STATE_TO_HISTORY':
      return {
        ...state,
        undoStack: [...state.undoStack, state.overlays],
        redoStack: [],
      };

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const previousState = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        overlays: previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.overlays],
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const nextState = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        overlays: nextState,
        undoStack: [...state.undoStack, state.overlays],
        redoStack: state.redoStack.slice(0, -1),
      };
    }

    case 'DUPLICATE_OVERLAY': {
      const overlayToDuplicate = state.overlays.find(o => o.id === action.payload);
      if (!overlayToDuplicate) return state;

      const duplicatedOverlay: Overlay = {
        ...overlayToDuplicate,
        id: Date.now().toString(),
        x: overlayToDuplicate.x + 20,
        y: overlayToDuplicate.y + 20,
      };

      return {
        ...state,
        overlays: [...state.overlays, duplicatedOverlay],
        selectedOverlayIds: [duplicatedOverlay.id],
      };
    }

    case 'COPY_OVERLAYS': {
      const overlaysToCopy = state.overlays.filter(o => action.payload.includes(o.id));
      clipboard = {
        overlays: overlaysToCopy,
        timestamp: Date.now(),
      };
      return state;
    }

    case 'PASTE_OVERLAYS': {
      if (!clipboard || clipboard.overlays.length === 0) return state;

      const pastedOverlays: Overlay[] = clipboard.overlays.map(overlay => ({
        ...overlay,
        id: `${Date.now()}-${Math.random()}`,
        x: overlay.x + 20,
        y: overlay.y + 20,
      }));

      return {
        ...state,
        overlays: [...state.overlays, ...pastedOverlays],
        selectedOverlayIds: pastedOverlays.map(o => o.id),
      };
    }

    case 'RESET_PROJECT':
      return initialState;

    default:
      return state;
  }
}

// Context type
interface EditorContextType {
  state: EditorState;
  setVideo: (uri: string, duration: number) => void;
  addOverlay: (overlay: Overlay) => void;
  updateOverlay: (update: OverlayUpdate) => void;
  deleteOverlay: (id: string) => void;
  deleteSelectedOverlays: () => void;
  selectOverlay: (id: string, multiSelect?: boolean) => void;
  deselectAll: () => void;
  setCurrentTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  undo: () => void;
  redo: () => void;
  saveStateToHistory: () => void;
  duplicateOverlay: (id: string) => void;
  copyOverlays: (ids: string[]) => void;
  pasteOverlays: () => void;
  resetProject: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

// Provider component
export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const setVideo = useCallback((uri: string, duration: number) => {
    dispatch({ type: 'SET_VIDEO', payload: { uri, duration } });
  }, []);

  const addOverlay = useCallback((overlay: Overlay) => {
    dispatch({ type: 'SAVE_STATE_TO_HISTORY' });
    dispatch({ type: 'ADD_OVERLAY', payload: overlay });
  }, []);

  const updateOverlay = useCallback((update: OverlayUpdate) => {
    dispatch({ type: 'UPDATE_OVERLAY', payload: update });
  }, []);

  const deleteOverlay = useCallback((id: string) => {
    dispatch({ type: 'SAVE_STATE_TO_HISTORY' });
    dispatch({ type: 'DELETE_OVERLAY', payload: id });
  }, []);

  const deleteSelectedOverlays = useCallback(() => {
    dispatch({ type: 'SAVE_STATE_TO_HISTORY' });
    dispatch({ type: 'DELETE_SELECTED_OVERLAYS' });
  }, []);

  const selectOverlay = useCallback((id: string, multiSelect = false) => {
    dispatch({ type: 'SELECT_OVERLAY', payload: { id, multiSelect } });
  }, []);

  const deselectAll = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' });
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_PLAYING', payload: playing });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    dispatch({ type: 'TOGGLE_SNAP_TO_GRID' });
  }, []);

  const setGridSize = useCallback((size: number) => {
    dispatch({ type: 'SET_GRID_SIZE', payload: size });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const saveStateToHistory = useCallback(() => {
    dispatch({ type: 'SAVE_STATE_TO_HISTORY' });
  }, []);

  const duplicateOverlay = useCallback((id: string) => {
    dispatch({ type: 'SAVE_STATE_TO_HISTORY' });
    dispatch({ type: 'DUPLICATE_OVERLAY', payload: id });
  }, []);

  const copyOverlays = useCallback((ids: string[]) => {
    dispatch({ type: 'COPY_OVERLAYS', payload: ids });
  }, []);

  const pasteOverlays = useCallback(() => {
    dispatch({ type: 'SAVE_STATE_TO_HISTORY' });
    dispatch({ type: 'PASTE_OVERLAYS' });
  }, []);

  const resetProject = useCallback(() => {
    dispatch({ type: 'RESET_PROJECT' });
  }, []);

  return (
    <EditorContext.Provider
      value={{
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
        setGridSize,
        undo,
        redo,
        saveStateToHistory,
        duplicateOverlay,
        copyOverlays,
        pasteOverlays,
        resetProject,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

// Custom hook
export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}
