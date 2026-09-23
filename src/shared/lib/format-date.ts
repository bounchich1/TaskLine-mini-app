/** "05 сент., 14:30" in the organization's timezone; `short` drops the time; "—" when empty. */
export function formatDate(value: string | null | undefined, timeZone: string, short = false) {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone,
    day: '2-digit',
    month: 'short',
    ...(short ? {} : { hour: '2-digit', minute: '2-digit' }),
  }).format(new Date(value));
}
