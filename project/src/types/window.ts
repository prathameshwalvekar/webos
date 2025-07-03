import { ReactNode } from 'react';

export interface WindowData {
  id: string;
  title: string;
  content: ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
}