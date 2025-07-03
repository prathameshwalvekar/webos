import React from 'react';
import { FolderPlus, FileText, Settings, RefreshCw } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const menuItems = [
    { icon: FolderPlus, label: 'New Folder', action: () => console.log('New Folder') },
    { icon: FileText, label: 'New Document', action: () => console.log('New Document') },
    { divider: true },
    { icon: RefreshCw, label: 'Refresh', action: () => console.log('Refresh') },
    { icon: Settings, label: 'Change Background', action: () => console.log('Change Background') },
  ];

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-48"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => (
        <div key={index}>
          {item.divider ? (
            <div className="border-t border-gray-200 my-1" />
          ) : (
            <button
              onClick={() => {
                item.action();
                onClose();
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;