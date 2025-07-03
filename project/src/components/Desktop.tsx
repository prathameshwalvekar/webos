import React, { useState } from 'react';
import Taskbar from './Taskbar';
import WindowManager from './WindowManager';
import ContextMenu from './ContextMenu';
import ActivitiesOverview from './ActivitiesOverview';

interface DesktopProps {
  onLogout: () => void;
  onPowerOff: () => void;
  username?: string;
}

const Desktop: React.FC<DesktopProps> = ({ onLogout, onPowerOff, username }) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showActivities, setShowActivities] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    setContextMenu(null);
  };

  return (
    <div
      className="relative h-full bg-cover bg-center"
      style={{
        backgroundImage: `url('https://live-production.wcms.abc-cdn.net.au/ca408f501dcedd5607cca73ff241de29?impolicy=wcms_crop_resize&cropH=1628&cropW=2893&xPos=107&yPos=365&width=862&height=485')`,
      }}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {/* Desktop overlay for better readability */}
      <div className="absolute inset-0 bg-black/10" />
      
      <WindowManager />
      
      <Taskbar 
        onActivitiesClick={() => setShowActivities(!showActivities)}
        showActivities={showActivities}
        onLogout={onLogout}
        onPowerOff={onPowerOff}
        username={username}
      />
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      {showActivities && (
        <ActivitiesOverview onClose={() => setShowActivities(false)} />
      )}
    </div>
  );
};

export default Desktop;