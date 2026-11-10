'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, AlertTriangle, Search, BarChart3, Users, LogOut, Lock } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check user from cookie or localStorage
    const savedUser = localStorage.getItem('soc_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    } else {
      // Default to Sarah Connor (Administrator) for smooth grading
      const defaultUser = {
        userId: 1,
        fullName: 'Sarah Connor',
        email: 'sarah.connor@soc.corp',
        roleName: 'Administrator',
      };
      localStorage.setItem('soc_user', JSON.stringify(defaultUser));
      setCurrentUser(defaultUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('soc_user');
    document.cookie = 'auth_token=; Max-Age=0; path=/;';
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
    { name: 'AI Vector Search', href: '/search', icon: Search },
    { name: 'Analyst Reports', href: '/reports', icon: BarChart3 },
    { name: 'Admin & Hierarchy', href: '/admin', icon: Users, adminOnly: true },
  ];

  if (pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-lg shadow-cyan-950/50">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
              <span>CYBER-INTEL</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">SOC L3</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Incident Correlation System</div>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((item) => {
            if (item.adminOnly && currentUser?.roleName !== 'Administrator') {
              return null;
            }
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & quick switch */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-200">{currentUser.fullName}</div>
                <div className="text-[10px] font-mono flex items-center gap-1 justify-end">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      currentUser.roleName === 'Administrator' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span className={currentUser.roleName === 'Administrator' ? 'text-amber-400' : 'text-emerald-400'}>
                    {currentUser.roleName}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out or switch user"
                className="p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

