'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, AlertCircle, Search, BarChart2, Users, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('soc_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    } else {
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
    { name: 'Incidents', href: '/incidents', icon: AlertCircle },
    { name: 'Semantic Search', href: '/search', icon: Search },
    { name: 'Reports', href: '/reports', icon: BarChart2 },
    { name: 'Admin', href: '/admin', icon: Users, adminOnly: true },
  ];

  if (pathname === '/login') return null;

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center space-x-2 text-slate-100 font-semibold text-sm">
          <Shield className="w-5 h-5 text-blue-500" />
          <span>Incident Tracker</span>
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
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="flex items-center space-x-3 text-xs">
          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="text-slate-300">
                {currentUser.fullName} <span className="text-slate-500">({currentUser.roleName})</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
