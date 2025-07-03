import React, { useState, useEffect } from 'react';
import { Save, FileText, Bold, Italic, Underline } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/files/write';

interface TextEditorProps {
  filename?: string;
  initialContent?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ filename: initialFilename, initialContent }) => {
  const [content, setContent] = useState(initialContent ?? 'Welcome to the Ubuntu Text Editor!\n\nStart typing to create your document...');
  const [filename, setFilename] = useState(initialFilename ?? 'Untitled Document.txt');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (initialFilename) setFilename(initialFilename);
    if (initialContent !== undefined) setContent(initialContent);
    // eslint-disable-next-line
  }, [initialFilename, initialContent]);

  const handleSave = async () => {
    if (!filename) return;
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filename, data: content })
    });
    if (res.ok) {
      setStatus('Saved!');
      setTimeout(() => setStatus(null), 1500);
    } else {
      setStatus('Error saving file');
      setTimeout(() => setStatus(null), 2000);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <FileText className="w-5 h-5 text-purple-500" />
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="font-medium text-gray-800 bg-transparent border-none outline-none"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
            <button className="p-1 hover:bg-gray-100 rounded">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Underline className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-4 border border-gray-300 rounded-lg resize-none outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Start typing..."
          style={{ fontFamily: 'monospace' }}
        />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Lines: {content.split('\n').length}</span>
          <span>Characters: {content.length}</span>
          {status && <span className="ml-4 text-green-600">{status}</span>}
        </div>
      </div>
    </div>
  );
};

export default TextEditor;