import { useState, useEffect } from 'react';
import { Category, Habit, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/habits';
import { getHabits, getLogs, getMonthDates, formatDate } from '@/lib/store';
import { getCategoryScore, getStreak } from '@/lib/insights';
import { Flame, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function MonthlyReview() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthDates = getMonthDates(year, month);
  const logs = getLogs();
  const monthLogs = logs.filter(l => l.date >= monthDates[0] && l.date <= monthDates[monthDates.length - 1]);

  useEffect(() => { setHabits(getHabits()); }, []);

  const categories: Category[] = ['health', 'money', 'relationships', 'learning', 'work', 'growth'];

  const categoryScores = categories.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    icon: CATEGORY_ICONS[cat],
    score: getCategoryScore(habits, monthLogs, cat, monthDates),
  }));

  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  const streaks = dailyHabits.map(h => ({
    ...h,
    streak: getStreak(h.id, logs, today),
  })).sort((a, b) => b.streak - a.streak);

  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Heatmap data
  const daysInMonth = monthDates.length;
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const heatmapData = monthDates.map(date => {
    const completed = dailyHabits.filter(h =>
      monthLogs.some(l => l.habitId === h.id && l.date === date && l.completed)
    ).length;
    const ratio = dailyHabits.length > 0 ? completed / dailyHabits.length : 0;
    return { date, ratio, completed, day: new Date(date).getDate() };
  });

  const getHeatColor = (ratio: number) => {
    if (ratio === 0) return 'bg-secondary';
    if (ratio < 0.33) return 'bg-primary/20';
    if (ratio < 0.66) return 'bg-primary/50';
    return 'bg-primary';
  };

  // Suggestions
  const suggestions: string[] = [];
  categoryScores.forEach(cs => {
    if (cs.score < 40) {
      suggestions.push(`Focus on improving ${cs.label} — currently at ${cs.score}%. Try setting smaller, achievable targets.`);
    } else if (cs.score >= 80) {
      suggestions.push(`Great work on ${cs.label}! Keep the momentum going at ${cs.score}%.`);
    }
  });
  if (suggestions.length === 0) {
    suggestions.push('You\'re making steady progress across all categories. Keep it up!');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display text-foreground">Monthly Review</h1>
        <p className="text-muted-foreground mt-1">{monthLabel}</p>
      </div>

      {/* Category performance */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Category Performance
        </h2>
        <div className="space-y-4">
          {categoryScores.map(cs => (
            <div key={cs.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span>{cs.icon}</span> {cs.label}
                </span>
                <span className="text-sm font-display text-primary">{cs.score}%</span>
              </div>
              <Progress value={cs.score} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Habit Heatmap */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-display text-foreground mb-4">Habit Heatmap</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-xs text-muted-foreground text-center font-medium py-1">{d}</div>
          ))}
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {heatmapData.map(d => (
            <div
              key={d.date}
              className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${getHeatColor(d.ratio)} ${
                d.ratio > 0.5 ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
              title={`${d.date}: ${d.completed}/${dailyHabits.length} habits`}
            >
              {d.day}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-secondary" />
            <div className="w-4 h-4 rounded bg-primary/20" />
            <div className="w-4 h-4 rounded bg-primary/50" />
            <div className="w-4 h-4 rounded bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-accent" /> Current Streaks
        </h2>
        <div className="space-y-3">
          {streaks.map(h => (
            <div key={h.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{CATEGORY_ICONS[h.category]}</span>
                <span className="text-sm text-foreground">{h.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className={`w-4 h-4 ${h.streak > 0 ? 'text-accent' : 'text-muted-foreground'}`} />
                <span className="text-sm font-display text-foreground">{h.streak} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-display text-foreground mb-4">💡 Improvement Suggestions</h2>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="text-sm text-muted-foreground bg-secondary rounded-lg px-4 py-3">
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
