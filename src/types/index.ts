export type TaskType = 'checkbox' | 'counter' | 'value' | 'water' | 'multi' | 'timer' | 'photo' | 'journal';

export interface TaskConfig {
  targetSec?: number;
  targetOz?: number;
  target?: number;
  unit?: string;
  options?: string[];
}

export interface Task {
  name: string;
  type: TaskType;
  icon: string;
  config: TaskConfig;
}

export interface TaskLog {
  done?: boolean;
  count?: number;
  value?: number | null;
  oz?: number;
  selected?: string[];
  elapsed?: number;
  running?: boolean;
  startedAt?: number;
  photo?: string;
  text?: string;
  late?: boolean;
}

export interface DayLog {
  tasks: Record<number, TaskLog>;
  completed?: boolean;
  failed?: boolean;
  caughtUp?: boolean;
  caughtUpDate?: string;
}

export interface Strictness {
  failureMode: 'restart' | 'continue' | 'penalty' | 'none';
  gracePeriod: number;
  freezes: number;
  minTasks: 'all' | number;
  dayResetHour?: number;
}

export interface Challenge {
  id: string;
  name: string;
  duration: number;
  startDate: string;
  tasks: Task[];
  strictness: Strictness;
  log: Record<string, DayLog>;
  resets: number;
  ended?: 'failed' | 'ended' | 'completed';
  endedDay?: number;
  endedDate?: string;
}

export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'ended';

export interface AppData {
  challenges: Challenge[];
  activeId: string | null;
  settings: {
    dayResetHour: number;
  };
}

export interface AppSettings {
  theme: string;
  primaryTheme: 'dark' | 'light' | 'neutral' | 'grey';
  notifications: boolean;
}
