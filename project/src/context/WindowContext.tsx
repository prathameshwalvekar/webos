import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WindowData } from '../types/window';

interface WindowState {
  windows: WindowData[];
  focusedWindow: string | null;
}

type WindowAction =
  | { type: 'OPEN_WINDOW'; payload: WindowData }
  | { type: 'CLOSE_WINDOW'; payload: string }
  | { type: 'UPDATE_WINDOW'; payload: { id: string; updates: Partial<WindowData> } }
  | { type: 'FOCUS_WINDOW'; payload: string };

const initialState: WindowState = {
  windows: [],
  focusedWindow: null,
};

const windowReducer = (state: WindowState, action: WindowAction): WindowState => {
  switch (action.type) {
    case 'OPEN_WINDOW':
      return {
        ...state,
        windows: [...state.windows, action.payload],
        focusedWindow: action.payload.id,
      };
    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== action.payload),
        focusedWindow: state.focusedWindow === action.payload ? null : state.focusedWindow,
      };
    case 'UPDATE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, ...action.payload.updates }
            : w
        ),
      };
    case 'FOCUS_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w => ({
          ...w,
          focused: w.id === action.payload,
        })),
        focusedWindow: action.payload,
      };
    default:
      return state;
  }
};

const WindowContext = createContext<{
  state: WindowState;
  openWindow: (window: WindowData) => void;
  closeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowData>) => void;
  focusWindow: (id: string) => void;
  windows: WindowData[];
} | undefined>(undefined);

export const WindowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(windowReducer, initialState);

  const openWindow = (window: WindowData) => {
    dispatch({ type: 'OPEN_WINDOW', payload: window });
  };

  const closeWindow = (id: string) => {
    dispatch({ type: 'CLOSE_WINDOW', payload: id });
  };

  const updateWindow = (id: string, updates: Partial<WindowData>) => {
    dispatch({ type: 'UPDATE_WINDOW', payload: { id, updates } });
  };

  const focusWindow = (id: string) => {
    dispatch({ type: 'FOCUS_WINDOW', payload: id });
  };

  return (
    <WindowContext.Provider
      value={{
        state,
        openWindow,
        closeWindow,
        updateWindow,
        focusWindow,
        windows: state.windows,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowContext = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowContext must be used within a WindowProvider');
  }
  return context;
};