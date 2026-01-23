import {
  format,
  startOfWeek,
  addDays,
  isWeekend,
  isFriday,
  isAfter,
  isBefore,
  setHours,
  setMinutes,
  nextMonday,
  addWeeks,
  parseISO,
} from 'date-fns';

/**
 * Get the display date for reminders based on current time
 * Before 10am GMT: show today's reminders
 * After 10am: show tomorrow's reminders
 * Friday after 10am or weekends: show next Monday's reminders
 */
export function getDisplayDate(now: Date = new Date()): Date {
  const tenAM = setMinutes(setHours(now, 10), 0);
  const isBeforeTenAM = isBefore(now, tenAM);

  if (isWeekend(now)) {
    return nextMonday(now);
  }

  if (isFriday(now)) {
    if (isBeforeTenAM) {
      return now;
    }
    return nextMonday(now);
  }

  if (isBeforeTenAM) {
    return now;
  }

  const tomorrow = addDays(now, 1);
  if (isWeekend(tomorrow)) {
    return nextMonday(now);
  }

  return tomorrow;
}

/**
 * Calculate the week start date (Monday) for a given date
 * If today is Friday, the week start is next Monday (for next week's mailings)
 */
export function calculateWeekStartDate(date: Date = new Date()): Date {
  if (isFriday(date)) {
    return nextMonday(date);
  }
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Format date for display
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMMM d');
}

/**
 * Format date for database storage
 */
export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get the current week's Monday date
 */
export function getCurrentWeekMonday(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

/**
 * Get dates for the current school week (Mon-Fri)
 */
export function getSchoolWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
}

/**
 * Format date range for week display
 */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 4);
  return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
}

/**
 * Get relative day description
 */
export function getRelativeDay(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diffDays = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return format(d, 'EEEE');

  return format(d, 'MMMM d');
}

/**
 * Check if it's time to show next week's content
 */
export function shouldShowNextWeek(): boolean {
  const now = new Date();
  const tenAM = setMinutes(setHours(now, 10), 0);

  return (isFriday(now) && isAfter(now, tenAM)) || isWeekend(now);
}
