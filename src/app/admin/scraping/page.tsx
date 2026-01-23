'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/page-transition';
import { toast } from 'sonner';
import type { ScrapingLogDisplay } from '@/types';

export default function ScrapingPage() {
  const [logs, setLogs] = useState<ScrapingLogDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/scraping/logs?limit=20');
      const data = await res.json();
      // Ensure data is an array
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerScraping = async () => {
    setIsScraping(true);
    try {
      const res = await fetch('/api/scraping/trigger', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchLogs();
      } else {
        toast.error(data.error || 'Scraping failed');
      }
    } catch (error) {
      toast.error('Failed to trigger scraping');
    } finally {
      setIsScraping(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-white/50" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      running: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
    return styles[status as keyof typeof styles] || 'bg-white/10 text-white/50';
  };

  const formatDuration = (start: Date, end: Date | null) => {
    if (!end) return 'In progress...';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <PageTransition>
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Scraping</h1>
            <p className="text-white/60">
              Manage web scraping for school mailings
            </p>
          </div>
          <div className="flex gap-3">
            <GlassButton
              variant="default"
              onClick={fetchLogs}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={triggerScraping}
              isLoading={isScraping}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Trigger Scraping
            </GlassButton>
          </div>
        </div>
      </FadeIn>

      {/* Info Card */}
      <FadeIn delay={0.1}>
        <GlassCard className="mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-emerald/30">
              <Globe className="w-6 h-6 text-accent-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Automated Scraping</h3>
              <p className="text-sm text-white/60 mb-4">
                The scraper automatically runs every Friday at 9:00 AM GMT to fetch the latest
                weekly mailings from the school website. You can also trigger a manual scrape
                using the button above.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/50 mb-1">Schedule</p>
                  <p className="font-medium">Every Friday 9 AM</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/50 mb-1">Total Runs</p>
                  <p className="font-medium">{logs.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/50 mb-1">Last Status</p>
                  <p className="font-medium capitalize">
                    {logs[0]?.status || 'Never run'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      {/* Logs Table */}
      <FadeIn delay={0.2}>
        <GlassCard>
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-emerald" />
            Scraping Logs
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 mx-auto mb-4 text-white/30" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                No Scraping History
              </h3>
              <p className="text-white/50">
                Trigger your first scrape to see logs here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">
                      Started At
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">
                      Duration
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">
                      Documents
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/80">
                        {new Date(log.startedAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-white/60">
                        {formatDuration(log.startedAt, log.completedAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent-primary" />
                          <span>
                            {log.documentsProcessed || 0} / {log.documentsFound || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {log.errorMessage ? (
                          <span className="text-red-400 text-sm truncate max-w-[200px] block">
                            {log.errorMessage}
                          </span>
                        ) : (
                          <span className="text-white/30">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </FadeIn>
    </PageTransition>
  );
}
