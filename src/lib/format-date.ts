/**
 * Formats an ISO date (`2026-08-08`) for display.
 *
 * Parsed as UTC and formatted in UTC so the rendered string can't shift by a
 * day between the build machine and the reader's timezone, which would make
 * the server and client markup disagree.
 */
export function formatPostDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
