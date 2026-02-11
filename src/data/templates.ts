import { Task, Strictness } from '../types';

export interface Template {
  name: string;
  duration: number;
  desc: string;
  tags: string[];
  strictness: Strictness;
  tasks: Task[];
}

export const TEMPLATES: Template[] = [
  {
    name: '75 Hard', duration: 75,
    desc: 'The original. No compromises, no excuses.',
    tags: ['Hardcore', '75 Days'],
    strictness: { failureMode: 'restart', gracePeriod: 0, freezes: 0, minTasks: 'all' },
    tasks: [
      { name: 'Follow a diet', type: 'checkbox', icon: '🍽️', config: {} },
      { name: 'Workout #1 (45 min)', type: 'timer', icon: '💪', config: { targetSec: 2700 } },
      { name: 'Workout #2 outdoor (45 min)', type: 'timer', icon: '🏃', config: { targetSec: 2700 } },
      { name: 'Drink 1 gallon of water', type: 'water', icon: '💧', config: { targetOz: 128 } },
      { name: 'Read 10 pages', type: 'value', icon: '📖', config: { target: 10, unit: 'pages' } },
      { name: 'Progress photo', type: 'photo', icon: '📸', config: {} },
      { name: 'No alcohol', type: 'checkbox', icon: '🚫', config: {} },
    ],
  },
  {
    name: '75 Medium', duration: 75,
    desc: 'Challenging but sustainable. Real life compatible.',
    tags: ['Moderate', '75 Days'],
    strictness: { failureMode: 'continue', gracePeriod: 1, freezes: 2, minTasks: 'all' },
    tasks: [
      { name: 'Follow a diet (1 cheat meal/week)', type: 'checkbox', icon: '🍽️', config: {} },
      { name: 'Workout (30 min)', type: 'timer', icon: '💪', config: { targetSec: 1800 } },
      { name: 'Drink 80oz water', type: 'water', icon: '💧', config: { targetOz: 80 } },
      { name: 'Read or learn (15 min)', type: 'value', icon: '📖', config: { target: 15, unit: 'min' } },
      { name: 'Journal / reflect', type: 'journal', icon: '📝', config: {} },
    ],
  },
  {
    name: '75 Soft', duration: 75,
    desc: 'Gentle start. Build the foundation.',
    tags: ['Beginner', '75 Days'],
    strictness: { failureMode: 'continue', gracePeriod: 2, freezes: 5, minTasks: 'all' },
    tasks: [
      { name: 'Eat well (mindful eating)', type: 'checkbox', icon: '🥗', config: {} },
      { name: 'Active movement (30 min)', type: 'timer', icon: '🚶', config: { targetSec: 1800 } },
      { name: 'Drink 64oz water', type: 'water', icon: '💧', config: { targetOz: 64 } },
      { name: 'Read 10 pages', type: 'value', icon: '📖', config: { target: 10, unit: 'pages' } },
    ],
  },
];

export const QUOTES = [
  { text: "We suffer more in imagination than in reality.", author: "Seneca" },
  { text: "The obstacle is the way.", author: "Marcus Aurelius" },
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "Hard choices, easy life. Easy choices, hard life.", author: "Jerzy Gregorek" },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
];
