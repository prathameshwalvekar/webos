import React, { useState, useEffect, useRef } from 'react';
import { Folder, File, ArrowLeft, Home, Search, Grid, List, Upload, Download, Trash2, Edit, Plus, MoreVertical } from 'lucide-react';
import { useWindowContext } from '../../context/WindowContext';
import TextEditor from './TextEditor';
import TerminalApp from './Terminal';

const API_URL = 'https://webos-1.onrender.com/files';

interface FileItem {
  name: string;
  isDirectory: boolean;
}

const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [items, setItems] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const { openWindow } = useWindowContext();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileItem | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch files/folders
  const fetchItems = async (path = currentPath) => {
    try {
      const res = await fetch(`${API_URL}?path=${encodeURIComponent(path)}`, { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          setError('You are not authorized. Please log in.');
        } else {
          setError('Failed to load files.');
        }
        setItems([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
        setError(null);
      } else {
        setItems([]);
        setError('Unexpected response from server.');
      }
    } catch (e) {
      setItems([]);
      setError('Failed to load files.');
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [currentPath]);

  // Navigation helpers
  const goHome = () => {
    setCurrentPath('');
    setHistory([]);
  };
  const goBack = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join('/'));
    setHistory((h) => h.slice(0, -1));
  };
  const enterFolder = (name: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${name}` : name);
    setHistory((h) => [...h, name]);
  };

  // Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath ? `${currentPath}/${file.name}` : file.name);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData, credentials: 'include' });
      if (!res.ok) throw new Error('Upload failed');
      fetchItems();
      setShowUpload(false);
    } catch (e) {
      setError('Failed to upload file.');
    }
  };

  // Download
  const handleDownload = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/download?path=${encodeURIComponent(currentPath ? currentPath + '/' + name : name)}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('Failed to download file.');
    }
  };

  // Delete
  const handleDelete = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath ? `${currentPath}/${name}` : name }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchItems();
    } catch (e) {
      setError('Failed to delete file.');
    }
  };

  // Rename
  const handleRename = async (oldName: string, newName: string) => {
    try {
      const res = await fetch(`${API_URL}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath: currentPath ? `${currentPath}/${oldName}` : oldName,
          newPath: currentPath ? `${currentPath}/${newName}` : newName
        }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Rename failed');
      setRenaming(null);
      setRenameValue('');
      fetchItems();
    } catch (e) {
      setError('Failed to rename file.');
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      const res = await fetch(`${API_URL}/mkdir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath ? `${currentPath}/${newFolderName}` : newFolderName }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Create folder failed');
      setShowNewFolder(false);
      setNewFolderName('');
      fetchItems();
    } catch (e) {
      setError('Failed to create folder.');
    }
  };

  // Drag-and-drop upload
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath ? `${currentPath}/${file.name}` : file.name);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData, credentials: 'include' });
      if (!res.ok) throw new Error('Upload failed');
      fetchItems();
    } catch (e) {
      setError('Failed to upload file.');
    }
  };

  // Double-click handler: open any file in TextEditor
  const handleFileDoubleClick = async (item: FileItem) => {
    if (item.isDirectory) {
      enterFolder(item.name);
      return;
    }
    const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
    try {
      const res = await fetch(`${API_URL}/read?path=${encodeURIComponent(filePath)}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to open file.');
      const data = await res.json();
      openWindow({
        id: `texteditor-${filePath}-${Date.now()}`,
        title: item.name,
        content: <TextEditor filename={filePath} initialContent={data.data} />,
        position: { x: 100, y: 100 },
        size: { width: 600, height: 500 },
        minimized: false,
        maximized: false,
        focused: true,
      });
    } catch (e) {
      setError('Failed to open file.');
    }
  };

  // Open in Terminal handler
  const handleOpenInTerminal = (item: FileItem) => {
    const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
    openWindow({
      id: `terminal-${filePath}-${Date.now()}`,
      title: `Terminal - ${item.name}`,
      content: <TerminalApp />,
      position: { x: 120, y: 120 },
      size: { width: 700, height: 400 },
      minimized: false,
      maximized: false,
      focused: true,
    });
    setContextMenu(null);
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    setSelected(item.name);
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };
  const handleContextMenuClose = () => setContextMenu(null);

  return (
    <div className="flex flex-col h-full bg-white" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      {error && <div className="p-4 text-red-600 font-medium">{error}</div>}
      {/* Context Menu */}
      {contextMenu && contextMenu.item && (
        <div
          className="fixed z-50 bg-white border rounded shadow-lg"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={handleContextMenuClose}
        >
          <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={e => { e.stopPropagation(); setRenaming(contextMenu.item!.name); setRenameValue(contextMenu.item!.name); setContextMenu(null); }}>Rename</button>
          <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={e => { e.stopPropagation(); handleDownload(contextMenu.item!.name); }}><Download className="w-4 h-4" /><span>Download</span></button>
          <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={e => { e.stopPropagation(); handleDelete(contextMenu.item!.name); setContextMenu(null); }}>Delete</button>
          <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={e => { e.stopPropagation(); handleOpenInTerminal(contextMenu.item!); }}>Open in Terminal</button>
        </div>
      )}
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={goBack} disabled={!currentPath}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={goHome}>
            <Home className="w-5 h-5" />
          </button>
          <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
            /{currentPath}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setShowUpload(true)}>
            <Upload className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setShowNewFolder(true)}>
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="mb-4 text-lg font-bold">Upload File</h2>
            <input type="file" ref={fileInputRef} onChange={handleUpload} />
            <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg" onClick={() => setShowUpload(false)}>Close</button>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="mb-4 text-lg font-bold">Create New Folder</h2>
            <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="border p-2 rounded mb-2" placeholder="Folder name" />
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg" onClick={handleCreateFolder}>Create</button>
              <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setShowNewFolder(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* File listing */}
      <div className="flex-1 p-4 overflow-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.isArray(items) && items.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer group relative"
                onClick={() => item.isDirectory ? enterFolder(item.name) : setSelected(item.name)}
                onDoubleClick={() => handleFileDoubleClick(item)}
                onContextMenu={e => handleContextMenu(e, item)}
              >
                {item.isDirectory ? (
                  <Folder className="w-12 h-12 text-blue-500 mb-2" />
                ) : (
                  <File className="w-12 h-12 text-gray-500 mb-2" />
                )}
                <span className="text-sm text-center truncate w-full">{item.name}</span>
                {!item.isDirectory && selected === item.name && (
                  <div className="absolute top-2 right-2 flex flex-col space-y-1 bg-white shadow-lg rounded p-2 z-10">

                  </div>
                )}
                {renaming === item.name && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-20">
                    <input className="border p-1 rounded mb-1" value={renameValue} onChange={e => setRenameValue(e.target.value)} />
                    <div className="flex space-x-1">
                      <button className="px-2 py-1 bg-orange-500 text-white rounded" onClick={() => handleRename(item.name, renameValue)}>Save</button>
                      <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => setRenaming(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {Array.isArray(items) && items.map((item) => (
              <div
                key={item.name}
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer group relative"
                onClick={() => item.isDirectory ? enterFolder(item.name) : setSelected(item.name)}
                onDoubleClick={() => handleFileDoubleClick(item)}
                onContextMenu={e => handleContextMenu(e, item)}
              >
                {item.isDirectory ? (
                  <Folder className="w-5 h-5 text-blue-500 mr-3" />
                ) : (
                  <File className="w-5 h-5 text-gray-500 mr-3" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.name}</div>
                </div>
                {!item.isDirectory && selected === item.name && (
                  <div className="absolute top-2 right-2 flex flex-col space-y-1 bg-white shadow-lg rounded p-2 z-10">
                    
                  </div>
                )}
                {renaming === item.name && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-20">
                    <input className="border p-1 rounded mb-1" value={renameValue} onChange={e => setRenameValue(e.target.value)} />
                    <div className="flex space-x-1">
                      <button className="px-2 py-1 bg-orange-500 text-white rounded" onClick={() => handleRename(item.name, renameValue)}>Save</button>
                      <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => setRenaming(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;