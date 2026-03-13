import { useState, useEffect } from 'react';
import { Category, Habit, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/habits';
import { getHabits, getLogs, getWeekDates, formatDate, getLogsForDateRange } from '@/lib/store';
import { getCategoryScore, getHabitCompletionRate, generateInsights } from '@/lib/insights';
import { Lightbulb, TrendingUp, TrendingDown, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function WeeklyReview() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const today = new Date();
  const weekDates = getWeekDates(today);
  const prevWeekStart = new Date(today);
  prevWeekStart.setDate(today.getDate() - 7);
  const prevWeekDates = getWeekDates(prevWeekStart);

  const logs = getLogs();
  const weekLogs = logs.filter(l => l.date >= weekDates[0] && l.date <= weekDates[6]);
  const prevWeekLogs = logs.filter(l => l.date >= prevWeekDates[0] && l.date <= prevWeekDates[6]);

  useEffect(() => { setHabits(getHabits()); }, []);

  const categories: Category[] = ['health', 'money', 'relationships', 'learning', 'work', 'growth'];

  const radarData = categories.map(cat => ({
    category: CATEGORY_LABELS[cat],
    score: getCategoryScore(habits, weekLogs, cat, weekDates),
    icon: CATEGORY_ICONS[cat],
  }));

  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  const habitRates = dailyHabits.map(h => ({
    name: h.name,
    rate: getHabitCompletionRate(h.id, weekLogs, weekDates),
    category: h.category,
  })).sort((a, b) => b.rate - a.rate);

  const best = habitRates.slice(0, 3);
  const worst = habitRates.slice(-3).reverse();

  const dailyData = weekDates.map(date => {
    const d = new Date(date);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const completed = dailyHabits.filter(h =>
      weekLogs.some(l => l.habitId === h.id && l.date === date && l.completed)
    ).length;
    return { day: dayLabel, completed, total: dailyHabits.length };
  });

  const insights = generateInsights(habits, weekLogs, prevWeekLogs, weekDates, prevWeekDates);

  const weekStart = new Date(weekDates[0]);
  const weekEnd = new Date(weekDates[6]);
  const rangeLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display text-foreground">Weekly Review</h1>
        <p className="text-muted-foreground mt-1">{rangeLabel}</p>
      </div>

      {/* Category Radar */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-display text-foreground mb-4">Category Scores</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {radarData.map(item => (
            <div key={item.category} className="flex items-center gap-2 text-sm">
              <span>{categories.find(c => CATEGORY_LABELS[c] === item.category) ? CATEGORY_ICONS[categories.find(c => CATEGORY_LABELS[c] === item.category)!] : ''}</span>
              <span className="text-foreground font-medium">{item.category}:</span>
              <span className="text-primary font-display">{item.score}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily completion chart */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-display text-foreground mb-4">Daily Completions</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best and Worst */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" /> Best Habits
          </h3>
          <div className="space-y-2">
            {best.map((h, i) => (
              <div key={h.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-sm text-foreground">{h.name}</span>
                </div>
                <span className="text-sm font-display text-primary">{h.rate}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-destructive" /> Needs Attention
          </h3>
          <div className="space-y-2">
            {worst.map(h => (
              <div key={h.name} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{h.name}</span>
                <span className="text-sm font-display text-destructive">{h.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" /> Insights
          </h2>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="text-sm text-muted-foreground bg-secondary rounded-lg px-4 py-3">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
