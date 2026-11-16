'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('soc_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoUser, demoPass = 'password123') => {
    setEmail(demoUser);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-black">
      <div className="max-w-sm w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-white">Incident Management Portal</h1>
          <p className="text-xs text-zinc-400 mt-1">Sign in with your role or email to continue</p>
        </div>

        {/* Card */}
        <div className="clean-card p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Username / Role</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin or analyst"
                className="w-full px-3 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin or password123"
                className="w-full px-3 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <div className="text-[11px] font-medium text-zinc-400 text-center">Quick-Fill Accounts</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin')}
                className="p-2 rounded bg-black border border-zinc-800 hover:border-zinc-600 text-left transition-colors"
              >
                <div className="font-semibold text-white">Administrator</div>
                <div className="text-[10px] text-zinc-400 truncate">username: admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('analyst', 'analyst')}
                className="p-2 rounded bg-black border border-zinc-800 hover:border-zinc-600 text-left transition-colors"
              >
                <div className="font-semibold text-white">Security Analyst</div>
                <div className="text-[10px] text-zinc-400 truncate">username: analyst</div>
              </button>
            </div>
            <div className="text-[10px] text-zinc-500 text-center">
              Simple login: <span className="text-zinc-300 font-mono">admin / admin</span> or <span className="text-zinc-300 font-mono">analyst / analyst</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
