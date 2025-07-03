import React, { useState } from 'react';
import { Grid3X3, Wifi, Battery, Volume2, Settings, User, Power, LogOut } from 'lucide-react';

interface TaskbarProps {
  onActivitiesClick: () => void;
  showActivities: boolean;
  onLogout: () => void;
  onPowerOff: () => void;
  username?: string;
}

const Taskbar: React.FC<TaskbarProps> = ({ onActivitiesClick, showActivities, onLogout, onPowerOff, username }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 h-12 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 flex items-center justify-between px-4 z-50">
      {/* Activities button */}
      <button
        onClick={onActivitiesClick}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
          showActivities 
            ? 'bg-orange-500 text-white shadow-lg' 
            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
        }`}
      >
        Activities
      </button>

      {/* Center - Clock */}
      <div className="flex flex-col items-center text-white">
        <div className="text-sm font-medium">{formatTime(currentTime)}</div>
        <div className="text-xs text-gray-300">{formatDate(currentTime)}</div>
      </div>

      {/* Right side - System indicators */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-gray-300">
          <Wifi className="w-4 h-4" />
          <Volume2 className="w-4 h-4" />
          <Battery className="w-4 h-4" />
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
          >
            <User className="w-5 h-5 text-gray-300" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
              <div className="px-4 py-2 text-white text-sm border-b border-gray-700">
                <div className="font-medium">{username || 'Ubuntu User'}</div>
                <div className="text-gray-400 text-xs">{username ? `${username}@ubuntu` : 'user@ubuntu'}</div>
              </div>
              <button className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <button className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
              <button className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center" onClick={onPowerOff}>
                <Power className="w-4 h-4 mr-2" />
                Power Off
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Taskbar;