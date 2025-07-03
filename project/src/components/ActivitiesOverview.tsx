import React from 'react';
import { Folder, Terminal, Calculator, FileText, Settings, X } from 'lucide-react';
import { useWindowContext } from '../context/WindowContext';
import FileManager from './applications/FileManager';
import TerminalApp from './applications/Terminal';
import CalculatorApp from './applications/Calculator';
import TextEditor from './applications/TextEditor';
import SettingsApp from './applications/Settings';

interface ActivitiesOverviewProps {
  onClose: () => void;
}

const ActivitiesOverview: React.FC<ActivitiesOverviewProps> = ({ onClose }) => {
  const { openWindow } = useWindowContext();

  const applications = [
    {
      name: 'Files',
      icon: Folder,
      component: <FileManager />,
      color: 'bg-blue-500',
    },
    {
      name: 'Terminal',
      icon: Terminal,
      component: <TerminalApp />,
      color: 'bg-gray-800',
    },
    {
      name: 'Calculator',
      icon: Calculator,
      component: <CalculatorApp />,
      color: 'bg-green-500',
    },
    {
      name: 'Text Editor',
      icon: FileText,
      component: <TextEditor />,
      color: 'bg-purple-500',
    },
    {
      name: 'Settings',
      icon: Settings,
      component: <SettingsApp />,
      color: 'bg-orange-500',
    },
  ];

  const handleAppClick = (app: typeof applications[0]) => {
    openWindow({
      id: `${app.name.toLowerCase()}-${Date.now()}`,
      title: app.name,
      content: app.component,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      minimized: false,
      maximized: false,
      focused: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Activities Overview</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {applications.map((app) => (
            <button
              key={app.name}
              onClick={() => handleAppClick(app)}
              className="flex flex-col items-center space-y-3 p-4 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <div className={`w-16 h-16 ${app.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <app.icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-white text-sm font-medium">{app.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesOverview;