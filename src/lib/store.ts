import { Habit, HabitLog } from '@/types/habits';

const HABITS_KEY = 'life-dashboard-habits';
const LOGS_KEY = 'life-dashboard-logs';

export const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Exercise', category: 'health', frequency: 'daily', target: '30 min', unit: 'minutes', trackValue: true },
  { id: '2', name: 'Drink Water', category: 'health', frequency: 'daily', target: '8 glasses', unit: 'glasses', trackValue: true },
  { id: '3', name: 'Meditate', category: 'health', frequency: 'daily', target: '10 min', unit: 'minutes', trackValue: true },
  { id: '4', name: 'Save Money', category: 'money', frequency: 'daily', target: '$10', unit: 'dollars', trackValue: true },
  { id: '5', name: 'Track Expenses', category: 'money', frequency: 'daily', target: 'Review spending' },
  { id: '6', name: 'Family Time', category: 'relationships', frequency: 'daily', target: '30 min', unit: 'minutes', trackValue: true },
  { id: '7', name: 'Call a Friend', category: 'relationships', frequency: 'weekly', target: '1 call' },
  { id: '8', name: 'Read', category: 'learning', frequency: 'daily', target: '20 pages', unit: 'pages', trackValue: true },
  { id: '9', name: 'Online Course', category: 'learning', frequency: 'weekly', target: '1 lesson' },
  { id: '10', name: 'Deep Work', category: 'work', frequency: 'daily', target: '2 hours', unit: 'hours', trackValue: true },
  { id: '11', name: 'Journal', category: 'growth', frequency: 'daily', target: 'Write entry' },
  { id: '12', name: 'Gratitude', category: 'growth', frequency: 'daily', target: '3 things' },
];

export function getHabits(): Habit[] {
  const stored = localStorage.getItem(HABITS_KEY);
  if (!stored) {
    localStorage.setItem(HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
    return DEFAULT_HABITS;
  }
  return JSON.parse(stored);
}

export function saveHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function addHabit(habit: Habit) {
  const habits = getHabits();
  habits.push(habit);
  saveHabits(habits);
  return habits;
}

export function deleteHabit(id: string) {
  const habits = getHabits().filter(h => h.id !== id);
  saveHabits(habits);
  return habits;
}

export function getLogs(): HabitLog[] {
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveLogs(logs: HabitLog[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function toggleHabitLog(habitId: string, date: string, value?: number) {
  const logs = getLogs();
  const existing = logs.find(l => l.habitId === habitId && l.date === date);
  if (existing) {
    existing.completed = !existing.completed;
    if (value !== undefined) existing.value = value;
  } else {
    logs.push({
      id: crypto.randomUUID(),
      habitId,
      date,
      completed: true,
      value,
    });
  }
  saveLogs(logs);
  return logs;
}

export function setHabitLogValue(habitId: string, date: string, value: number) {
  const logs = getLogs();
  const existing = logs.find(l => l.habitId === habitId && l.date === date);
  if (existing) {
    existing.value = value;
    existing.completed = true;
  } else {
    logs.push({
      id: crypto.randomUUID(),
      habitId,
      date,
      completed: true,
      value,
    });
  }
  saveLogs(logs);
  return logs;
}

export function getLogsForDate(date: string): HabitLog[] {
  return getLogs().filter(l => l.date === date);
}

export function getLogsForDateRange(start: string, end: string): HabitLog[] {
  return getLogs().filter(l => l.date >= start && l.date <= end);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getWeekDates(referenceDate: Date): string[] {
  const day = referenceDate.getDay();
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - (day === 0 ? 6 : day - 1));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(formatDate(new Date(year, month, i)));
  }
  return dates;
}
