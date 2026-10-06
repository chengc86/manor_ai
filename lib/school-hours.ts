// School-hours lock for Manor Quest.
//
// Play is closed on weekdays in Europe/London from 08:40 inclusive until 16:00 exclusive.
// Saturdays, Sundays, and every date inside SCHOOL_HOLIDAYS stay open all day.
//
// To change the timetable, edit SCHOOL_HOURS. To add or move a holiday, edit SCHOOL_HOLIDAYS.
// Dates are inclusive calendar days in Europe/London (YYYY-MM-DD). A day in a range is open
// from midnight to midnight, with no school-hours check.
//
// Seeded from The Manor Preparatory School term dates:
// https://www.manorprep.org/school-life/term-dates/
// The last morning of a term still uses the normal 8:40am–4:00pm window. Add that date as a
// one-day range only if the whole day should be open. Summer 2028 begins after Friday 7 July 2028;
// add it once the first day of autumn 2028 is published, for example
// {start:'2028-07-08', end:'<day before autumn term>', name:'Summer holiday 2028'}.

export const SCHOOL_TIME_ZONE = 'Europe/London';

export const SCHOOL_HOURS = {
  timeZone: SCHOOL_TIME_ZONE,
  start: {hour: 8, minute: 40},
  end: {hour: 16, minute: 0},
} as const;

export type SchoolHoliday = {start: string; end: string; name: string};

export const SCHOOL_HOLIDAYS: SchoolHoliday[] = [
  {start: '2026-10-19', end: '2026-10-30', name: 'October half-term 2026'},
  {start: '2026-12-12', end: '2027-01-05', name: 'Christmas holiday 2026'},
  {start: '2027-02-15', end: '2027-02-19', name: 'February half-term 2027'},
  {start: '2027-03-26', end: '2027-04-20', name: 'Easter holiday 2027'},
  {start: '2027-05-03', end: '2027-05-03', name: 'May Day bank holiday 2027'},
  {start: '2027-05-31', end: '2027-06-04', name: 'May half-term 2027'},
  {start: '2027-07-10', end: '2027-09-05', name: 'Summer holiday 2027'},
  {start: '2027-10-18', end: '2027-10-29', name: 'October half-term 2027'},
  {start: '2027-12-18', end: '2028-01-10', name: 'Christmas holiday 2027'},
  {start: '2028-02-14', end: '2028-02-18', name: 'February half-term 2028'},
  {start: '2028-04-01', end: '2028-04-25', name: 'Easter holiday 2028'},
  {start: '2028-05-01', end: '2028-05-01', name: 'May Day bank holiday 2028'},
  {start: '2028-05-29', end: '2028-06-02', name: 'May half-term 2028'},
];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
for (const holiday of SCHOOL_HOLIDAYS) {
  if (!DATE.test(holiday.start) || !DATE.test(holiday.end) || holiday.start > holiday.end) {
    throw new Error(`School holiday "${holiday.name}" needs start and end as YYYY-MM-DD, with start on or before end.`);
  }
}

const WEEKDAYS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

const londonClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: SCHOOL_TIME_ZONE,
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export type LondonParts = {date: string; weekday: string; minutes: number};

export function londonParts(at: Date): LondonParts {
  const parts = Object.fromEntries(londonClock.formatToParts(at).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  return {date: `${parts.year}-${parts.month}-${parts.day}`, weekday: parts.weekday, minutes: hour * 60 + minute};
}

export function onSchoolHoliday(date: string) {
  return SCHOOL_HOLIDAYS.some(holiday => date >= holiday.start && date <= holiday.end);
}

/** True while Manor Quest should refuse play. `at` defaults to the current time. */
export function isSchoolLocked(at = new Date()) {
  const {date, weekday, minutes} = londonParts(at);
  if (!WEEKDAYS.has(weekday) || onSchoolHoliday(date)) return false;
  const start = SCHOOL_HOURS.start.hour * 60 + SCHOOL_HOURS.start.minute;
  const end = SCHOOL_HOURS.end.hour * 60 + SCHOOL_HOURS.end.minute;
  return minutes >= start && minutes < end;
}

function clockLabel(hour: number, minute: number) {
  const h = hour % 12 || 12;
  const suffix = hour < 12 ? 'am' : 'pm';
  return `${h}:${String(minute).padStart(2, '0')}${suffix}`;
}

export type SchoolLockCopy = {locked: true; title: string; body: string; hours: string; note: string};

export function schoolLockCopy(): SchoolLockCopy {
  const opens = clockLabel(SCHOOL_HOURS.start.hour, SCHOOL_HOURS.start.minute);
  const closes = clockLabel(SCHOOL_HOURS.end.hour, SCHOOL_HOURS.end.minute);
  return {
    locked: true,
    title: 'Your heroes have gone to school',
    body: 'They’re in lessons just now. Come back outside school hours, and they’ll be here for the next quest.',
    hours: `Monday to Friday, ${opens}–${closes}`,
    note: `Manor Quest unlocks by itself before ${opens}, from ${closes}, at the weekend, and all day in half-term and the school holidays.`,
  };
}

export function schoolLockPayload() {
  const schoolLock = schoolLockCopy();
  return {error: 'Your heroes have gone to school. Come back outside school hours.', schoolLock};
}
