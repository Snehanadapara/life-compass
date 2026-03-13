export type Category = 'health' | 'money' | 'relationships' | 'learning' | 'work' | 'growth';

export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  category: Category;
  frequency: Frequency;
  target: string;
  unit?: string;
  trackValue?: boolean; // if true, log a numeric value instead of just complete/incomplete
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  health: 'Health',
  money: 'Money / Finance',
  relationships: 'Relationships',
  learning: 'Learning',
  work: 'Work / Career',
  growth: 'Personal Growth',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  health: '💪',
  money: '💰',
  relationships: '❤️',
  learning: '📚',
  work: '💼',
  growth: '🌱',
};
