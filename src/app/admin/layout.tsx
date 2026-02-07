'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Globe,
  Settings,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/year-groups', label: 'Year Groups', icon: Users },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
  { href: '/admin/timetables', label: 'Timetables', icon: Calendar },
  { href: '/admin/scraping', label: 'Scraping', icon: Globe },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin', { method: 'DELETE' });
      toast.success('Logged out successfully');
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Desktop Sidebar */}
      <aside
        style={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden lg:flex flex-col bg-gray-900 border-r border-gray-800 fixed h-screen z-30 transition-all duration-300"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            {isSidebarOpen && (
              <div>
                <span className="text-xl font-bold text-white">Manor AI</span>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                    active
                      ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-emerald-400')} />
                  {isSidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {active && isSidebarOpen && (
                    <div className="ml-auto">
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ChevronRight
              className={cn('w-5 h-5 transition-transform duration-200', !isSidebarOpen && 'rotate-180')}
            />
            {isSidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>

        {/* Back to Parent View */}
        <div className="p-4 border-t border-gray-800">
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <ChevronRight className="w-5 h-5 rotate-180" />
              {isSidebarOpen && <span className="text-sm">Parent View</span>}
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold text-white">Manor AI</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 z-20 bg-gray-900 border-b border-gray-800">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      active
                        ? 'bg-emerald-500/15 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-180" />
                <span className="font-medium">Parent View</span>
              </div>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
        className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 bg-gray-950 min-h-screen transition-all duration-300 max-lg:!ml-0"
      >
        {children}
      </main>
    </div>
  );
}
