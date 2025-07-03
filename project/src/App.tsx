import React, { useEffect, useState } from 'react';
import Desktop from './components/Desktop';
import { WindowProvider } from './context/WindowContext';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [session, setSession] = useState<{ loggedIn: boolean; username?: string } | null>(null);
  const [powerOff, setPowerOff] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // Check session on mount
  useEffect(() => {
    fetch(`${API_URL}/auth/status`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSession(data));
  }, []);

  // Fetch users for login/register
  useEffect(() => {
    fetch(`${API_URL}/auth/users`, { credentials: 'include' })
      .then(res => res.json())
      .then(setUsers);
  }, [showRegister]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSession({ loggedIn: true, username: form.username });
    } else {
      setError('Invalid credentials');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSession({ loggedIn: true, username: form.username });
      setShowRegister(false);
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed');
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    setSession({ loggedIn: false });
  };

  const handlePowerOff = () => {
    setPowerOff(true);
    setSession({ loggedIn: false });
  };
  const handlePowerOn = () => {
    setPowerOff(false);
  };

  if (powerOff) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl mb-8">System Powered Off</h1>
        <button className="px-6 py-3 bg-orange-500 rounded-lg text-white text-xl" onClick={handlePowerOn}>Start</button>
      </div>
    );
  }

  if (!session || !session.loggedIn) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">{showRegister ? 'Register' : 'Login'}</h2>
          <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                list="user-list"
                autoComplete="username"
                required
              />
              {!showRegister && (
                <datalist id="user-list">
                  {users.map(u => <option key={u} value={u} />)}
                </datalist>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                autoComplete={showRegister ? 'new-password' : 'current-password'}
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold">
              {showRegister ? 'Register' : 'Login'}
            </button>
          </form>
          <div className="mt-4 text-center">
            {showRegister ? (
              <button className="text-orange-600 hover:underline" onClick={() => { setShowRegister(false); setError(''); }}>Back to Login</button>
            ) : (
              <>
                <span>Not listed?</span>{' '}
                <button className="text-orange-600 hover:underline" onClick={() => { setShowRegister(true); setError(''); }}>Register</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <WindowProvider>
      <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600">
        <Desktop onLogout={handleLogout} onPowerOff={handlePowerOff} username={session.username} />
      </div>
    </WindowProvider>
  );
}

export default App;