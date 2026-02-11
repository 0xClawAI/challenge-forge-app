import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge, Task, TaskLog, DayLog, Strictness } from '../types';
import { uid, getToday, getDayNum, getDayKey } from '../utils/date';
import { getDayLog, isTaskDone, isDayDone } from '../utils/challenge';

interface ChallengeState {
  challenges: Challenge[];
  activeId: string | null;
  dayResetHour: number;

  // Actions
  setActiveId: (id: string | null) => void;
  createChallenge: (name: string, duration: number, tasks: Task[], strictness: Strictness) => void;
  updateChallenge: (id: string, updates: Partial<Pick<Challenge, 'name' | 'tasks' | 'strictness'>>) => void;
  updateTaskLog: (challengeId: string, dateKey: string, taskIdx: number, update: Partial<TaskLog>) => void;
  failChallenge: (id: string) => void;
  endChallenge: (id: string) => void;
  resetAllData: () => void;
  importData: (challenges: Challenge[], activeId: string | null) => void;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      challenges: [],
      activeId: null,
      dayResetHour: 0,

      setActiveId: (id) => set({ activeId: id }),

      createChallenge: (name, duration, tasks, strictness) => {
        const todayStr = getToday(get().dayResetHour);
        const challenge: Challenge = {
          id: uid(),
          name,
          duration,
          startDate: todayStr,
          tasks: tasks.map(t => ({ ...t, config: { ...t.config } })),
          strictness: { ...strictness },
          log: {},
          resets: 0,
        };
        set((state) => ({
          challenges: [...state.challenges, challenge],
          activeId: challenge.id,
          dayResetHour: strictness.dayResetHour || 0,
        }));
      },

      updateChallenge: (id, updates) => {
        set((state) => ({
          challenges: state.challenges.map(c =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      updateTaskLog: (challengeId, dateKey, taskIdx, update) => {
        set((state) => ({
          challenges: state.challenges.map(c => {
            if (c.id !== challengeId) return c;
            const log = { ...c.log };
            if (!log[dateKey]) log[dateKey] = { tasks: {} };
            const dayLog = { ...log[dateKey], tasks: { ...log[dateKey].tasks } };
            dayLog.tasks[taskIdx] = { ...(dayLog.tasks[taskIdx] || {}), ...update };
            log[dateKey] = dayLog;
            return { ...c, log };
          }),
        }));
      },

      failChallenge: (id) => {
        const todayStr = getToday(get().dayResetHour);
        set((state) => ({
          challenges: state.challenges.map(c => {
            if (c.id !== id) return c;
            const dn = getDayNum(c.startDate, c.duration, todayStr);
            return { ...c, ended: 'failed' as const, endedDay: dn, endedDate: todayStr };
          }),
          activeId: state.activeId === id ? null : state.activeId,
        }));
      },

      endChallenge: (id) => {
        const todayStr = getToday(get().dayResetHour);
        set((state) => ({
          challenges: state.challenges.map(c => {
            if (c.id !== id) return c;
            const dn = getDayNum(c.startDate, c.duration, todayStr);
            return { ...c, ended: 'ended' as const, endedDay: dn, endedDate: todayStr };
          }),
          activeId: state.activeId === id ? null : state.activeId,
        }));
      },

      resetAllData: () => set({ challenges: [], activeId: null }),

      importData: (challenges, activeId) => set({ challenges, activeId }),
    }),
    {
      name: 'challenge-forge-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
