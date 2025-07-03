import React, { useState, useRef } from 'react';
import { Minimize2, Maximize2, X, Minus } from 'lucide-react';
import { useWindowContext } from '../context/WindowContext';
import { WindowData } from '../types/window';

interface WindowProps {
  window: WindowData;
}

const Window: React.FC<WindowProps> = ({ window }) => {
  const { updateWindow, closeWindow, focusWindow } = useWindowContext();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('window-header')) {
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      focusWindow(window.id);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && windowRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      updateWindow(window.id, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) },
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleMinimize = () => {
    updateWindow(window.id, { minimized: true });
  };

  const handleMaximize = () => {
    updateWindow(window.id, { maximized: !window.maximized });
  };

  const handleClose = () => {
    closeWindow(window.id);
  };

  if (window.minimized) return null;

  const windowStyle = window.maximized
    ? { top: 0, left: 0, width: '100%', height: '100%' }
    : {
        top: window.position.y,
        left: window.position.x,
        width: window.size.width,
        height: window.size.height,
      };

  return (
    <div
      ref={windowRef}
      className={`absolute bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden ${
        window.focused ? 'z-40' : 'z-30'
      }`}
      style={windowStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Window Header */}
      <div className="window-header flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-move">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full cursor-pointer hover:bg-red-600" onClick={handleClose} />
          <div className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-600" onClick={handleMinimize} />
          <div className="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-600" onClick={handleMaximize} />
        </div>
        <div className="text-sm font-medium text-gray-800">{window.title}</div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="h-full overflow-auto">
        {window.content}
      </div>
    </div>
  );
};

export default Window;