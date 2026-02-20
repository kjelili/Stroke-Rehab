import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await login(username, password);
    if (ok) navigate('/app');
    else setError('Invalid credentials. Try demo / demo.');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface-elevated border border-gray-800 p-8 shadow-xl">
        <h1 className="font-display font-bold text-2xl text-white mb-2">Neuro-Recover</h1>
        <p className="text-gray-400 text-sm mb-6">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-surface-muted border border-gray-700 px-4 py-2 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-surface-muted border border-gray-700 px-4 py-2 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="tap-target w-full rounded-xl bg-brand-500 py-3 text-white font-medium hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            Sign in
          </button>
        </form>
        <p className="text-gray-500 text-xs mt-4">Demo: username <code>demo</code>, password <code>demo</code></p>
      </div>
    </div>
  );
}
