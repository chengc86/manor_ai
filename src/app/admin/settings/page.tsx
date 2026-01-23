'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Loader2,
  Globe,
  Key,
  MessageSquare,
  FileText,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui';
import { GlassInput, GlassTextarea } from '@/components/ui/glass-input';
import { PageTransition, FadeIn } from '@/components/animations/page-transition';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    scraping_url: '',
    scraping_password: '',
    llm_prompt_template: '',
    fact_sheet_content: '',
  });
  const [schedule, setSchedule] = useState({
    dayOfWeek: 5,
    timeOfDay: '09:00',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPrompt, setIsResettingPrompt] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchSchedule();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings({
        scraping_url: data.scraping_url || '',
        scraping_password: data.scraping_password || '',
        llm_prompt_template: data.llm_prompt_template || '',
        fact_sheet_content: data.fact_sheet_content || '',
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/scraping/schedule');
      const data = await res.json();
      setSchedule({
        dayOfWeek: data.dayOfWeek ?? 5,
        timeOfDay: data.timeOfDay || '09:00',
        isActive: data.isActive ?? true,
      });
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save settings
      const settingsRes = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      // Save schedule
      const scheduleRes = await fetch('/api/scraping/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });

      if (settingsRes.ok && scheduleRes.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save some settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetPromptTemplate = async () => {
    setIsResettingPrompt(true);
    try {
      const res = await fetch('/api/settings/reset-prompt', {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Prompt template updated to latest version');
        // Refresh settings to show updated prompt
        fetchSettings();
      } else {
        toast.error('Failed to update prompt template');
      }
    } catch (error) {
      toast.error('Failed to update prompt template');
    } finally {
      setIsResettingPrompt(false);
    }
  };

  const settingsGroups = [
    {
      title: 'Scraping Configuration',
      description: 'Configure the school website scraping settings',
      icon: Globe,
      color: 'from-accent-primary/30 to-blue-500/30',
      iconColor: 'text-accent-primary',
      fields: [
        {
          key: 'scraping_url',
          label: 'Scraping URL',
          type: 'input',
          placeholder: 'https://school-website.com/parent-zone',
          icon: Globe,
        },
        {
          key: 'scraping_password',
          label: 'Password',
          type: 'password',
          placeholder: 'Enter the password for protected content',
          icon: Key,
        },
      ],
    },
    {
      title: 'LLM Configuration',
      description: 'Configure the AI prompt template for generating reminders',
      icon: MessageSquare,
      color: 'from-accent-emerald/30 to-violet-500/30',
      iconColor: 'text-accent-emerald',
      hasResetButton: true,
      fields: [
        {
          key: 'llm_prompt_template',
          label: 'Prompt Template',
          type: 'textarea',
          placeholder: 'Enter the prompt template for the LLM...',
          icon: MessageSquare,
        },
      ],
    },
    {
      title: 'Fact Sheet Content',
      description: 'General fact sheet information used for all year groups',
      icon: FileText,
      color: 'from-accent-gold/30 to-rose-500/30',
      iconColor: 'text-accent-gold',
      fields: [
        {
          key: 'fact_sheet_content',
          label: 'Content',
          type: 'textarea',
          placeholder: 'Enter general fact sheet content...',
          icon: FileText,
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
            <p className="text-white/60">
              Configure scraping and LLM parameters
            </p>
          </div>
          <GlassButton
            variant="primary"
            onClick={saveSettings}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Settings
          </GlassButton>
        </div>
      </FadeIn>

      <div className="space-y-8">
        {/* Scraping Schedule Section */}
        <FadeIn delay={0.1}>
          <GlassCard>
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-emerald/30">
                <Calendar className="w-6 h-6 text-accent-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Scraping Schedule</h3>
                <p className="text-sm text-white/60">Configure when automatic scraping runs</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Day of Week
                </label>
                <select
                  value={schedule.dayOfWeek}
                  onChange={(e) => setSchedule({ ...schedule, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value} className="bg-gray-900">
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Time (24h format)
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="time"
                    value={schedule.timeOfDay}
                    onChange={(e) => setSchedule({ ...schedule, timeOfDay: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Status
                </label>
                <button
                  onClick={() => setSchedule({ ...schedule, isActive: !schedule.isActive })}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    schedule.isActive
                      ? 'bg-accent-primary/20 border-accent-primary/50 text-accent-primary'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  {schedule.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-white/5">
              <p className="text-sm text-white/60">
                <span className="font-medium text-white/80">Current schedule:</span>{' '}
                {DAYS_OF_WEEK.find(d => d.value === schedule.dayOfWeek)?.label} at {schedule.timeOfDay} GMT
                {!schedule.isActive && ' (Disabled)'}
              </p>
            </div>
          </GlassCard>
        </FadeIn>

        {settingsGroups.map((group, groupIndex) => (
          <FadeIn key={group.title} delay={0.1 * (groupIndex + 2)}>
            <GlassCard>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${group.color}`}
                  >
                    <group.icon className={`w-6 h-6 ${group.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{group.title}</h3>
                    <p className="text-sm text-white/60">{group.description}</p>
                  </div>
                </div>
                {'hasResetButton' in group && group.hasResetButton && (
                  <GlassButton
                    variant="default"
                    size="sm"
                    onClick={resetPromptTemplate}
                    isLoading={isResettingPrompt}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Use Latest Prompt
                  </GlassButton>
                )}
              </div>

              <div className="space-y-6">
                {group.fields.map((field) => (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {field.type === 'textarea' ? (
                      <GlassTextarea
                        label={field.label}
                        value={settings[field.key as keyof typeof settings]}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [field.key]: e.target.value,
                          })
                        }
                        placeholder={field.placeholder}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    ) : field.type === 'password' ? (
                      <GlassInput
                        label={field.label}
                        type={showPassword ? 'text' : 'password'}
                        value={settings[field.key as keyof typeof settings]}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [field.key]: e.target.value,
                          })
                        }
                        placeholder={field.placeholder}
                        leftIcon={<field.icon className="w-4 h-4" />}
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
                    ) : (
                      <GlassInput
                        label={field.label}
                        type="text"
                        value={settings[field.key as keyof typeof settings]}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [field.key]: e.target.value,
                          })
                        }
                        placeholder={field.placeholder}
                        leftIcon={<field.icon className="w-4 h-4" />}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </FadeIn>
        ))}
      </div>
    </PageTransition>
  );
}
