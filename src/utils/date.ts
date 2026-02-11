export function getToday(dayResetHour: number = 0): string {
  const n = new Date();
  if (n.getHours() < dayResetHour) n.setDate(n.getDate() - 1);
  return n.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getDayKey(startDate: string, dayNum: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayNum - 1);
  return d.toISOString().slice(0, 10);
}

export function getDayNum(startDate: string, duration: number, todayStr: string): number {
  return Math.min(daysBetween(startDate, todayStr) + 1, duration);
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
