import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Palette, 
  Wifi, 
  Volume2, 
  User, 
  Shield, 
  HardDrive,
  Bluetooth,
  Mouse,
  Keyboard
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/settings';

const accentColors = ['orange', 'blue', 'green', 'purple', 'red'];
const resolutions = [
  '1920 × 1080 (16:9)',
  '1680 × 1050 (16:10)',
  '1440 × 900 (16:10)'
];
const scales = ['100%', '125%', '150%', '200%'];

const SettingsApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState('appearance');
  const [theme, setTheme] = useState('light');
  const [accent, setAccent] = useState('orange');
  const [resolution, setResolution] = useState(resolutions[0]);
  const [scale, setScale] = useState(scales[0]);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);
  const [pointerSpeed, setPointerSpeed] = useState(5);
  const [tapToClick, setTapToClick] = useState(true);
  const [keyRepeat, setKeyRepeat] = useState(5);
  const [shortcuts, setShortcuts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setTheme(data.theme || 'light');
        setAccent(data.accent || 'orange');
        setResolution(data.resolution || resolutions[0]);
        setScale(data.scale || scales[0]);
        setVolume(data.volume ?? 50);
        setMuted(data.muted ?? false);
        setPointerSpeed(data.pointerSpeed ?? 5);
        setTapToClick(data.tapToClick ?? true);
        setKeyRepeat(data.keyRepeat ?? 5);
        setShortcuts(data.shortcuts ?? true);
        setLoading(false);
      });
  }, []);

  const saveSettings = async (updates: any) => {
    setLoading(true);
    const newSettings = {
      theme, accent, resolution, scale, volume, muted, pointerSpeed, tapToClick, keyRepeat, shortcuts,
      ...updates
    };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    setLoading(false);
    if (res.ok) {
      setStatus('Saved!');
      setTimeout(() => setStatus(null), 1200);
    } else {
      setStatus('Error saving');
      setTimeout(() => setStatus(null), 2000);
    }
  };

  // Handlers for each setting
  const handleThemeChange = (newTheme: string) => { setTheme(newTheme); saveSettings({ theme: newTheme }); };
  const handleAccentChange = (newAccent: string) => { setAccent(newAccent); saveSettings({ accent: newAccent }); };
  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setResolution(e.target.value); saveSettings({ resolution: e.target.value }); };
  const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setScale(e.target.value); saveSettings({ scale: e.target.value }); };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => { setVolume(Number(e.target.value)); saveSettings({ volume: Number(e.target.value) }); };
  const handleMuteToggle = () => { setMuted(!muted); saveSettings({ muted: !muted }); };
  const handlePointerSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => { setPointerSpeed(Number(e.target.value)); saveSettings({ pointerSpeed: Number(e.target.value) }); };
  const handleTapToClickToggle = () => { setTapToClick(!tapToClick); saveSettings({ tapToClick: !tapToClick }); };
  const handleKeyRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => { setKeyRepeat(Number(e.target.value)); saveSettings({ keyRepeat: Number(e.target.value) }); };
  const handleShortcutsToggle = () => { setShortcuts(!shortcuts); saveSettings({ shortcuts: !shortcuts }); };

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="flex space-x-4">
                  <button onClick={() => handleThemeChange('light')} className={`px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Light</button>
                  <button onClick={() => handleThemeChange('dark')} className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Dark</button>
                  <button onClick={() => handleThemeChange('auto')} className={`px-4 py-2 rounded-lg ${theme === 'auto' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Auto</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <div className="flex space-x-2">
                  {accentColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleAccentChange(color)}
                      className={`w-8 h-8 rounded-full bg-${color}-500 ${accent === color ? 'ring-2 ring-gray-400' : ''}`}
                    />
                  ))}
                </div>
              </div>
              {status && <div className="text-green-600 font-medium">{status}</div>}
            </div>
          </div>
        );
      case 'displays':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Displays</h2>
            <div className="bg-gray-100 rounded-lg p-6">
              <div className="flex items-center justify-center h-32 bg-gray-200 rounded border-2 border-dashed border-gray-300">
                <Monitor className="w-16 h-16 text-gray-400" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-medium">Built-in Display</h3>
                <p className="text-sm text-gray-600">{resolution}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg" value={resolution} onChange={handleResolutionChange}>
                  {resolutions.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scale</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg" value={scale} onChange={handleScaleChange}>
                  {scales.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {status && <div className="text-green-600 font-medium">{status}</div>}
          </div>
        );
      case 'sound':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Sound</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Volume</label>
                <input type="range" min={0} max={100} value={volume} onChange={handleVolumeChange} className="w-48" />
                <span>{volume}</span>
                <button onClick={handleMuteToggle} className={`ml-4 px-3 py-1 rounded ${muted ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{muted ? 'Unmute' : 'Mute'}</button>
              </div>
            </div>
            {status && <div className="text-green-600 font-medium">{status}</div>}
          </div>
        );
      case 'mouse':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Mouse & Touchpad</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Pointer Speed</label>
                <input type="range" min={1} max={10} value={pointerSpeed} onChange={handlePointerSpeedChange} className="w-48" />
                <span>{pointerSpeed}</span>
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Tap to Click</label>
                <button onClick={handleTapToClickToggle} className={`px-3 py-1 rounded ${tapToClick ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{tapToClick ? 'Enabled' : 'Disabled'}</button>
              </div>
            </div>
            {status && <div className="text-green-600 font-medium">{status}</div>}
          </div>
        );
      case 'keyboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Keyboard</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Key Repeat Rate</label>
                <input type="range" min={1} max={10} value={keyRepeat} onChange={handleKeyRepeatChange} className="w-48" />
                <span>{keyRepeat}</span>
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Shortcuts</label>
                <button onClick={handleShortcutsToggle} className={`px-3 py-1 rounded ${shortcuts ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{shortcuts ? 'Enabled' : 'Disabled'}</button>
              </div>
            </div>
            {status && <div className="text-green-600 font-medium">{status}</div>}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeSection.replace('-', ' & ')}</h2>
            <p className="text-gray-600">This setting cannot be managed from the browser.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">Settings</h1>
        </div>
        <nav className="px-2 pb-4">
          {[
            { id: 'appearance', name: 'Appearance', icon: Palette },
            { id: 'displays', name: 'Displays', icon: Monitor },
            { id: 'sound', name: 'Sound', icon: Volume2 },
            { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
            { id: 'bluetooth', name: 'Bluetooth', icon: Bluetooth },
            { id: 'users', name: 'Users', icon: User },
            { id: 'privacy', name: 'Privacy', icon: Shield },
            { id: 'storage', name: 'Storage', icon: HardDrive },
            { id: 'mouse', name: 'Mouse & Touchpad', icon: Mouse },
            { id: 'keyboard', name: 'Keyboard', icon: Keyboard },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span>{section.name}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? <div>Loading...</div> : renderContent()}
      </div>
    </div>
  );
};

export default SettingsApp;