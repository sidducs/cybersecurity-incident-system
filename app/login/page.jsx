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

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-blue-400 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Incident Management Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in with your credentials to continue</p>
        </div>

        {/* Card */}
        <div className="clean-card p-6 space-y-5 shadow-sm">
          {error && (
            <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@soc.corp"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-700/60 space-y-2">
            <div className="text-[11px] font-medium text-slate-400 text-center">Demo Accounts</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('sarah.connor@soc.corp')}
                className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition-colors"
              >
                <div className="font-semibold text-slate-200">Administrator</div>
                <div className="text-[10px] text-slate-400 truncate">sarah.connor</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('alex.rivera@soc.corp')}
                className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition-colors"
              >
                <div className="font-semibold text-slate-200">Security Analyst</div>
                <div className="text-[10px] text-slate-400 truncate">alex.rivera</div>
              </button>
            </div>
            <div className="text-[10px] text-slate-500 text-center">
              Password: <span className="text-slate-400 font-mono">password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
