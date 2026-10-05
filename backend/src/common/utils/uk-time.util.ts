/**
 * Utilities for UK Timezone (Europe/London: GMT / BST) operations.
 * Fairway Draws operates primarily in the UK market.
 */

export const UK_TIMEZONE = 'Europe/London';

/**
 * Returns the current abbreviation for the UK timezone ("BST" during British Summer Time, "GMT" in winter).
 */
export function getUkTimezoneAbbr(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: UK_TIMEZONE,
      timeZoneName: 'short',
    }).formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value || 'UK Time';
  } catch {
    return 'UK Time';
  }
}

/**
 * Parses a date input string or Date object.
 * If given a naive datetime string without timezone information (e.g. "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD HH:mm"),
 * it interprets it as UK local time (Europe/London) and converts it to the proper UTC Date object.
 * If already an ISO string with explicit timezone offset or "Z", it parses directly.
 */
export function parseUkDateTimeToUtc(
  input: string | Date | null | undefined,
): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  const str = String(input).trim();
  if (!str) return null;

  // Check if string has explicit timezone offset (+/-HH:MM or Z)
  if (/([+-]\d{2}:?\d{2}|Z)$/i.test(str)) {
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Handle "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD HH:mm" (or with optional seconds)
  const match = str.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!match) {
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const [, year, month, day, hour, min, sec] = match;
  const y = parseInt(year, 10);
  const m = parseInt(month, 10) - 1;
  const d = parseInt(day, 10);
  const h = parseInt(hour, 10);
  const mi = parseInt(min, 10);
  const s = sec ? parseInt(sec, 10) : 0;

  // 1. Construct naive UTC date
  const naiveUtc = new Date(Date.UTC(y, m, d, h, mi, s));

  // 2. Format naiveUtc in Europe/London to see what local time it yields
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: UK_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(naiveUtc);
  const getPart = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value || '0', 10);

  const ukYear = getPart('year');
  const ukMonth = getPart('month') - 1;
  const ukDay = getPart('day');
  let ukHour = getPart('hour');
  if (ukHour === 24) ukHour = 0;
  const ukMin = getPart('minute');
  const ukSec = getPart('second');

  const formattedAsUtc = Date.UTC(ukYear, ukMonth, ukDay, ukHour, ukMin, ukSec);
  const offsetDiff = naiveUtc.getTime() - formattedAsUtc;

  return new Date(naiveUtc.getTime() + offsetDiff);
}

/**
 * Formats a UTC Date or ISO string into an HTML <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm")
 * in the Europe/London timezone.
 */
export function formatUtcToUkInputString(
  dateInput: string | Date | null | undefined,
): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || '00';
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  let hour = getPart('hour');
  if (hour === '24') hour = '00';
  const minute = getPart('minute');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Formats a date in human-friendly UK format (e.g. "20 Sep 2026, 14:30 BST").
 */
export function formatUkDateTime(
  dateInput: string | Date | null | undefined,
  includeTimezone = true,
): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: UK_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  if (includeTimezone) {
    options.timeZoneName = 'short';
  }

  return new Intl.DateTimeFormat('en-GB', options).format(date);
}

/**
 * Formats a date in UK date-only format (e.g. "20 Sep 2026").
 */
export function formatUkDate(
  dateInput: string | Date | null | undefined,
): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
