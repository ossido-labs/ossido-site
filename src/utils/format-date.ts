/**
 * Format an ISO date (`YYYY-MM-DD`) for display. Fixed locale + UTC so the server
 * and client always produce the same string (no hydration mismatch).
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
