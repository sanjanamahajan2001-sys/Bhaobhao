export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
