const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;
const BYTES_PER_UNIT = 1024;
const DATE_LOCALE = 'en-US';

const shortDateFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  month: 'short',
  day: 'numeric',
});

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  let size = bytes;
  let unitIndex = 0;

  while (size >= BYTES_PER_UNIT && unitIndex < BYTE_UNITS.length - 1) {
    size /= BYTES_PER_UNIT;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${BYTE_UNITS[unitIndex]}`;
}

export function formatShortDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return shortDateFormatter.format(date);
}
