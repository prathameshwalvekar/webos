import React from 'react';
import { useWindowContext } from '../context/WindowContext';
import Window from './Window';

const WindowManager: React.FC = () => {
  const { windows } = useWindowContext();

  return (
    <div className="absolute inset-0 pt-12 pb-16">
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
    </div>
  );
};

export default WindowManager;