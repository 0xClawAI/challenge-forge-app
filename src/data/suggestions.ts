import { Task } from '../types';

export interface TaskSuggestion {
  name: string;
  type: Task['type'];
  icon: string;
  config: Task['config'];
  desc: string;
}

export interface SuggestionCategory {
  cat: string;
  items: TaskSuggestion[];
}

export const TASK_SUGGESTIONS: SuggestionCategory[] = [
  {
    cat: '🏋️ Fitness',
    items: [
      { name: 'Workout', type: 'timer', icon: '🏋️', config: { targetSec: 2700 }, desc: '45-minute workout session' },
      { name: 'Steps', type: 'counter', icon: '👟', config: { unit: 'steps' }, desc: 'Track your daily steps' },
      { name: 'Stretching', type: 'checkbox', icon: '🤸', config: {}, desc: 'Daily stretch routine' },
      { name: 'Run', type: 'timer', icon: '🏃', config: { targetSec: 1800 }, desc: '30-minute run' },
      { name: '2-a-day Workout', type: 'multi', icon: '💪', config: { options: ['Indoor workout', 'Outdoor workout'] }, desc: 'Complete both workouts daily' },
    ],
  },
  {
    cat: '🥗 Nutrition',
    items: [
      { name: 'Follow diet plan', type: 'checkbox', icon: '🥗', config: {}, desc: 'Stick to your meal plan' },
      { name: 'Track calories', type: 'value', icon: '🔥', config: { target: 2000, unit: 'cal' }, desc: 'Log daily calorie intake' },
      { name: 'Drink water', type: 'water', icon: '💧', config: { targetOz: 64 }, desc: 'Hit your hydration goal' },
      { name: 'No alcohol', type: 'checkbox', icon: '🚫', config: {}, desc: 'Stay alcohol-free today' },
      { name: 'No sugar', type: 'checkbox', icon: '🍬', config: {}, desc: 'Avoid added sugars' },
    ],
  },
  {
    cat: '📚 Learning',
    items: [
      { name: 'Read', type: 'value', icon: '📖', config: { target: 10, unit: 'pages' }, desc: 'Read 10 pages a day' },
      { name: 'Study', type: 'timer', icon: '📚', config: { targetSec: 3600 }, desc: '1-hour study session' },
      { name: 'Journal', type: 'journal', icon: '✍️', config: {}, desc: 'Write a journal entry' },
    ],
  },
  {
    cat: '🧘 Mindfulness',
    items: [
      { name: 'Meditate', type: 'timer', icon: '🧘', config: { targetSec: 600 }, desc: '10-minute meditation' },
      { name: 'Gratitude journal', type: 'journal', icon: '🙏', config: {}, desc: "Write 3 things you're grateful for" },
      { name: 'Cold shower', type: 'checkbox', icon: '🚿', config: {}, desc: 'Take a cold shower' },
      { name: 'No phone first hour', type: 'checkbox', icon: '📵', config: {}, desc: 'Phone-free morning routine' },
    ],
  },
  {
    cat: '📸 Accountability',
    items: [
      { name: 'Progress photo', type: 'photo', icon: '📸', config: {}, desc: 'Snap a daily progress pic' },
      { name: 'Daily reflection', type: 'journal', icon: '💭', config: {}, desc: 'Reflect on your day' },
    ],
  },
];
