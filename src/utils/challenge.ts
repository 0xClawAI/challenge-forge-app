import { Challenge, ChallengeStatus, Task, TaskLog, DayLog } from '../types';
import { getToday, daysBetween, getDayKey, getDayNum } from './date';

export function getDayLog(ch: Challenge, dateKey: string): DayLog {
  if (!ch.log) ch.log = {};
  if (!ch.log[dateKey]) ch.log[dateKey] = { tasks: {} };
  return ch.log[dateKey];
}

export function isTaskDone(t: Task, tl: TaskLog | undefined): boolean {
  if (!tl) return false;
  switch (t.type) {
    case 'checkbox': return !!tl.done;
    case 'counter': return (tl.count || 0) > 0;
    case 'value': return tl.value != null && tl.value !== null;
    case 'water': return (tl.oz || 0) >= (t.config?.targetOz || 64);
    case 'multi': return (tl.selected?.length || 0) >= (t.config?.options?.length || 1);
    case 'timer': return (tl.elapsed || 0) >= (t.config?.targetSec || 0);
    case 'photo': return !!tl.photo;
    case 'journal': return !!(tl.text?.trim());
    default: return !!tl.done;
  }
}

export function isDayDone(ch: Challenge, dateKey: string): boolean {
  const log = getDayLog(ch, dateKey);
  const doneCount = ch.tasks.filter((t, i) => isTaskDone(t, log.tasks[i])).length;
  if (ch.strictness?.minTasks === 'all') return doneCount === ch.tasks.length;
  return doneCount >= (typeof ch.strictness?.minTasks === 'number' ? ch.strictness.minTasks : ch.tasks.length);
}

export function getStatus(ch: Challenge, dayResetHour: number = 0): ChallengeStatus {
  const todayStr = getToday(dayResetHour);
  const dn = getDayNum(ch.startDate, ch.duration, todayStr);
  if (ch.ended === 'failed') return 'failed';
  if (ch.ended === 'ended') return 'ended';
  if (ch.ended === 'completed') return 'completed';
  if (dn > ch.duration) {
    return isDayDone(ch, getDayKey(ch.startDate, ch.duration)) ? 'completed' : 'failed';
  }
  return 'active';
}

export function getStreak(ch: Challenge, dayResetHour: number = 0): number {
  const todayStr = getToday(dayResetHour);
  const dn = getDayNum(ch.startDate, ch.duration, todayStr);
  let streak = 0;
  const startDay = todayStr === getDayKey(ch.startDate, dn) ? dn - 1 : dn;
  for (let i = startDay; i >= 1; i--) {
    if (isDayDone(ch, getDayKey(ch.startDate, i))) streak++;
    else break;
  }
  return streak;
}

export function getCompletedDays(ch: Challenge, upToDay: number): number {
  let count = 0;
  for (let i = 1; i <= upToDay; i++) {
    if (isDayDone(ch, getDayKey(ch.startDate, i))) count++;
  }
  return count;
}
