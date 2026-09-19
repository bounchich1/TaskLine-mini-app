/** Converts an organization-local calendar boundary to UTC, independent of the device timezone. */
export function dayBoundary(day: string, timeZone: string, nextDay = false): string {
  const [year, month, date] = day.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1, date + (nextDay ? 1 : 0)));
  let guess = target.getTime();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  for (let i = 0; i < 3; i++) {
    const p = Object.fromEntries(
      formatter.formatToParts(new Date(guess)).map((p) => [p.type, p.value]),
    );
    const represented = Date.UTC(
      Number(p.year),
      Number(p.month) - 1,
      Number(p.day),
      Number(p.hour),
      Number(p.minute),
      Number(p.second),
    );
    const delta = target.getTime() - represented;
    if (delta === 0) break;
    guess += delta;
  }
  return new Date(guess).toISOString();
}
