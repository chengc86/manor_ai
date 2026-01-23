'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AnimatedBackground = dynamic(
  () => import('@/components/three/animated-background').then((mod) => mod.AnimatedBackground),
  { ssr: false }
);

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
    <>
      <AnimatedBackground />

      <div className="min-h-screen flex">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hidden lg:flex flex-col glass-sidebar fixed h-screen z-30"
        >
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3">
              <motion.div
                className="p-2.5 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-emerald/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Sparkles className="w-6 h-6 text-accent-primary" />
              </motion.div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xl font-bold gradient-text">Manor AI</span>
                    <p className="text-xs text-white/50">Admin Panel</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                      active
                        ? 'bg-gradient-to-r from-accent-primary/20 to-accent-emerald/20 text-white border border-accent-primary/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-accent-primary')} />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {active && isSidebarOpen && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto"
                        transition={{ type: 'spring', duration: 0.5 }}
                      >
                        <ChevronRight className="w-4 h-4 text-accent-primary" />
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Collapse Button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <motion.div
                animate={{ rotate: isSidebarOpen ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm"
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Back to Parent View */}
          <div className="p-4 border-t border-white/10">
            <Link href="/">
              <motion.div
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
                whileHover={{ x: 4 }}
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm"
                    >
                      Parent View
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
              whileHover={{ x: 4 }}
            >
              <LogOut className="w-5 h-5" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 glass-sidebar p-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-emerald/30">
                <Sparkles className="w-5 h-5 text-accent-primary" />
              </div>
              <span className="text-lg font-bold gradient-text">Manor AI</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden fixed top-16 left-0 right-0 z-20 glass-sidebar border-t border-white/10"
            >
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                          active
                            ? 'bg-gradient-to-r from-accent-primary/20 to-accent-emerald/20 text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    <span className="font-medium">Parent View</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.main
          initial={false}
          animate={{ marginLeft: isSidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8"
        >
          {children}
        </motion.main>
      </div>
    </>
  );
}
