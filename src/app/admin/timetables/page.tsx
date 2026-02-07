'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui';
import { GlassTextarea } from '@/components/ui/glass-input';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/page-transition';
import { toast } from 'sonner';
import type { YearGroupDisplay } from '@/types';

export default function TimetablesPage() {
  const [yearGroups, setYearGroups] = useState<YearGroupDisplay[]>([]);
  const [timetables, setTimetables] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchYearGroups();
  }, []);

  const fetchYearGroups = async () => {
    try {
      const res = await fetch('/api/year-groups');
      const data = await res.json();
      setYearGroups(data);

      // Fetch timetables for each year group
      for (const yg of data) {
        const timetableRes = await fetch(`/api/timetables?yearGroupId=${yg.id}`);
        const timetableData = await timetableRes.json();
        setTimetables((prev) => ({
          ...prev,
          [yg.id]: timetableData.timetableJson || '',
        }));
      }
    } catch (error) {
      console.error('Failed to fetch year groups:', error);
      toast.error('Failed to load timetables');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTimetable = async (yearGroupId: string) => {
    setSavingId(yearGroupId);
    try {
      const res = await fetch('/api/timetables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearGroupId,
          timetableJson: timetables[yearGroupId],
        }),
      });

      if (res.ok) {
        toast.success('Timetable saved successfully');
      } else {
        toast.error('Failed to save timetable');
      }
    } catch (error) {
      toast.error('Failed to save timetable');
    } finally {
      setSavingId(null);
    }
  };

  const validateJson = (json: string): boolean => {
    if (!json.trim()) return true;
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <PageTransition>
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Timetables</h1>
            <p className="text-white/60">
              Paste JSON timetable data for each year group
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <GlassCard className="mb-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-accent-primary/20">
              <Calendar className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">JSON Timetable Format</h3>
              <p className="text-sm text-white/60 mb-3">
                Paste your timetable data in JSON format. This data will be used by the LLM
                to generate accurate reminders based on each year group's schedule.
              </p>
              <div className="p-3 rounded-lg bg-black/30 font-mono text-sm text-white/70 overflow-x-auto">
                <pre>{`{
  "monday": [
    { "time": "09:00", "subject": "Math", "notes": "Bring calculator" },
    { "time": "10:30", "subject": "PE", "notes": "Wear PE kit" }
  ],
  "tuesday": [...],
  ...
}`}</pre>
              </div>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        </div>
      ) : (
        <StaggerContainer className="space-y-6">
          {yearGroups.map((yg) => {
            const isValid = validateJson(timetables[yg.id] || '');

            return (
              <StaggerItem key={yg.id}>
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-accent-emerald/30 to-pink-500/30">
                        <Calendar className="w-5 h-5 text-accent-emerald" />
                      </div>
                      <h3 className="text-lg font-semibold">{yg.name}</h3>
                      {timetables[yg.id] && isValid && (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Valid JSON
                        </span>
                      )}
                      {timetables[yg.id] && !isValid && (
                        <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full">
                          Invalid JSON
                        </span>
                      )}
                    </div>
                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={() => saveTimetable(yg.id)}
                      isLoading={savingId === yg.id}
                      disabled={!isValid}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save
                    </GlassButton>
                  </div>
                  <GlassTextarea
                    value={timetables[yg.id] || ''}
                    onChange={(e) =>
                      setTimetables((prev) => ({
                        ...prev,
                        [yg.id]: e.target.value,
                      }))
                    }
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      setTimetables((prev) => ({
                        ...prev,
                        [yg.id]: pastedText,
                      }));
                    }}
                    placeholder={`Paste JSON timetable for ${yg.name}...`}
                    className="font-mono text-sm min-h-[200px]"
                    error={!isValid && timetables[yg.id] ? 'Invalid JSON format' : undefined}
                  />
                </GlassCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
