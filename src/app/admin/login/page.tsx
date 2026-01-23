'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { GlassCard, GlassButton } from '@/components/ui';
import { GlassInput } from '@/components/ui/glass-input';
import { toast } from 'sonner';

const AnimatedBackground = dynamic(
  () => import('@/components/three/animated-background').then((mod) => mod.AnimatedBackground),
  { ssr: false }
);

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Welcome to Admin Panel');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error(data.error || 'Invalid password');
      }
    } catch (error) {
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatedBackground />

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-accent-primary/30 to-accent-emerald/30 mb-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Sparkles className="w-10 h-10 text-accent-primary" />
              </motion.div>
              <h1 className="text-2xl font-bold gradient-text mb-2">Manor AI Admin</h1>
              <p className="text-white/60">Enter your admin password to continue</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <GlassInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />

              <GlassButton
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Access Admin Panel
              </GlassButton>
            </form>

            {/* Back to Parent View */}
            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Back to Parent View
              </a>
            </div>
          </GlassCard>

          {/* Security Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-white/30 mt-4"
          >
            Protected admin area. Unauthorized access is prohibited.
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
