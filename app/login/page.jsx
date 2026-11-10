'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

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

      // Save user session in localStorage for UI state
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/60 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            SOC Portal Authentication
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-mono">
            Cybersecurity Incident Correlation & Response Intelligence System
          </p>
        </div>

        {/* Card */}
        <div className="cyber-card p-6 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@soc.corp"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/60 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to SOC Console'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Evaluation Demo Quick-Fill
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('sarah.connor@soc.corp')}
                className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <UserCheck className="w-3.5 h-3.5" />
                  Administrator
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">sarah.connor@soc.corp</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('alex.rivera@soc.corp')}
                className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5" />
                  Security Analyst
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">alex.rivera@soc.corp</div>
              </button>
            </div>
            <div className="text-[10px] text-slate-500 text-center font-mono">
              Password for all accounts: <span className="text-slate-300">password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

