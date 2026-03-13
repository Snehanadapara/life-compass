import { Category, Habit, HabitLog, CATEGORY_LABELS } from '@/types/habits';
import { getLogsForDateRange, getWeekDates, formatDate } from '@/lib/store';

export function getCategoryScore(
  habits: Habit[],
  logs: HabitLog[],
  category: Category,
  dates: string[]
): number {
  const catHabits = habits.filter(h => h.category === category);
  if (catHabits.length === 0) return 0;

  let total = 0;
  let completed = 0;
  for (const habit of catHabits) {
    const relevantDates = habit.frequency === 'weekly' ? [dates[dates.length - 1]] : dates;
    total += relevantDates.length;
    completed += relevantDates.filter(d =>
      logs.some(l => l.habitId === habit.id && l.date === d && l.completed)
    ).length;
  }
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function getHabitCompletionRate(
  habitId: string,
  logs: HabitLog[],
  dates: string[]
): number {
  const completed = dates.filter(d =>
    logs.some(l => l.habitId === habitId && l.date === d && l.completed)
  ).length;
  return dates.length > 0 ? Math.round((completed / dates.length) * 100) : 0;
}

export function getStreak(habitId: string, logs: HabitLog[], endDate: Date): number {
  let streak = 0;
  const current = new Date(endDate);
  while (true) {
    const dateStr = formatDate(current);
    const found = logs.find(l => l.habitId === habitId && l.date === dateStr && l.completed);
    if (!found) break;
    streak++;
    current.setDate(current.getDate() - 1);
  }
  return streak;
}

export function generateInsights(
  habits: Habit[],
  currentWeekLogs: HabitLog[],
  prevWeekLogs: HabitLog[],
  currentWeekDates: string[],
  prevWeekDates: string[]
): string[] {
  const insights: string[] = [];

  for (const habit of habits.filter(h => h.frequency === 'daily')) {
    const currentCount = currentWeekDates.filter(d =>
      currentWeekLogs.some(l => l.habitId === habit.id && l.date === d && l.completed)
    ).length;
    const prevCount = prevWeekDates.filter(d =>
      prevWeekLogs.some(l => l.habitId === habit.id && l.date === d && l.completed)
    ).length;
    const diff = currentCount - prevCount;

    if (diff > 0) {
      insights.push(`You completed "${habit.name}" ${currentCount} days this week, +${diff} from last week 🎉`);
    } else if (diff < 0) {
      insights.push(`You completed "${habit.name}" ${currentCount} days this week, ${diff} from last week`);
    }

    if (currentCount === 0 && currentWeekDates.length >= 3) {
      insights.push(`You skipped "${habit.name}" all week — try to get back on track!`);
    }
  }

  const categories: Category[] = ['health', 'money', 'relationships', 'learning', 'work', 'growth'];
  for (const cat of categories) {
    const currentScore = getCategoryScore(habits, currentWeekLogs, cat, currentWeekDates);
    const prevScore = getCategoryScore(habits, prevWeekLogs, cat, prevWeekDates);
    const diff = currentScore - prevScore;
    if (Math.abs(diff) >= 10) {
      const direction = diff > 0 ? 'improved' : 'declined';
      insights.push(`${CATEGORY_LABELS[cat]} score ${direction} by ${Math.abs(diff)}% compared to last week`);
    }
  }

  return insights.slice(0, 6);
}
