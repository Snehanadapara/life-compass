import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp } from 'lucide-react';
import { Habit, HabitLog, Category, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/habits';
import { getHabits, getLogs, toggleHabitLog, setHabitLogValue, formatDate, getLogsForDate } from '@/lib/store';
import { getCategoryScore } from '@/lib/insights';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

const CATEGORY_BG_MAP: Record<Category, string> = {
  health: 'bg-category-health/10',
  money: 'bg-category-money/10',
  relationships: 'bg-category-relationships/10',
  learning: 'bg-category-learning/10',
  work: 'bg-category-work/10',
  growth: 'bg-category-growth/10',
};

const CATEGORY_COLOR_MAP: Record<Category, string> = {
  health: 'category-health',
  money: 'category-money',
  relationships: 'category-relationships',
  learning: 'category-learning',
  work: 'category-work',
  growth: 'category-growth',
};

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const today = formatDate(new Date());

  const loadData = useCallback(() => {
    setHabits(getHabits());
    setLogs(getLogs());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const todayLogs = logs.filter(l => l.date === today);
  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  const completedCount = dailyHabits.filter(h =>
    todayLogs.some(l => l.habitId === h.id && l.completed)
  ).length;
  const overallProgress = dailyHabits.length > 0 ? Math.round((completedCount / dailyHabits.length) * 100) : 0;

  const handleToggle = (habitId: string) => {
    const updated = toggleHabitLog(habitId, today);
    setLogs(updated);
  };

  const handleValue = (habitId: string, value: number) => {
    const updated = setHabitLogValue(habitId, today, value);
    setLogs(updated);
  };

  const categories: Category[] = ['health', 'money', 'relationships', 'learning', 'work', 'growth'];
  const groupedHabits = categories.map(cat => ({
    category: cat,
    habits: dailyHabits.filter(h => h.category === cat),
  })).filter(g => g.habits.length > 0);

  const todayDate = new Date();
  const dayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = todayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display text-foreground">{dayName}</h1>
        <p className="text-muted-foreground mt-1">{dateStr}</p>
      </div>

      {/* Overall progress */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Today's Progress</span>
          </div>
          <span className="text-2xl font-display text-primary">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          {completedCount} of {dailyHabits.length} habits completed
        </p>
      </div>

      {/* Category scores */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {categories.map(cat => {
          const score = getCategoryScore(habits, todayLogs, cat, [today]);
          return (
            <div key={cat} className={`rounded-xl p-4 ${CATEGORY_BG_MAP[cat]}`}>
              <div className="text-2xl mb-1">{CATEGORY_ICONS[cat]}</div>
              <div className={`text-xl font-display ${CATEGORY_COLOR_MAP[cat]}`}>{score}%</div>
              <div className="text-xs text-muted-foreground">{CATEGORY_LABELS[cat]}</div>
            </div>
          );
        })}
      </div>

      {/* Habits by category */}
      <div className="space-y-6">
        {groupedHabits.map(({ category, habits: catHabits }) => (
          <div key={category}>
            <h2 className="text-lg font-display text-foreground mb-3 flex items-center gap-2">
              <span>{CATEGORY_ICONS[category]}</span>
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="space-y-2">
              <AnimatePresence>
                {catHabits.map(habit => {
                  const log = todayLogs.find(l => l.habitId === habit.id);
                  const isComplete = log?.completed || false;

                  return (
                    <motion.div
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                        isComplete
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-card border-border'
                      }`}
                    >
                      <button
                        onClick={() => handleToggle(habit.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isComplete
                            ? 'bg-primary border-primary animate-check-bounce'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {isComplete && <Check className="w-4 h-4 text-primary-foreground" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${isComplete ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {habit.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{habit.target}</div>
                      </div>

                      {habit.trackValue && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8 text-sm text-center"
                            placeholder="0"
                            value={log?.value ?? ''}
                            onChange={(e) => handleValue(habit.id, Number(e.target.value))}
                          />
                          <span className="text-xs text-muted-foreground">{habit.unit}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
