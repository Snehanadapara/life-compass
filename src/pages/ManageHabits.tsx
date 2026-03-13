import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { Habit, Category, CATEGORY_LABELS, CATEGORY_ICONS, Frequency } from '@/types/habits';
import { getHabits, addHabit, deleteHabit } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function ManageHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('health');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [trackValue, setTrackValue] = useState(false);

  useEffect(() => { setHabits(getHabits()); }, []);

  const handleAdd = () => {
    if (!name.trim() || !target.trim()) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      category,
      frequency,
      target: target.trim(),
      unit: trackValue ? unit.trim() : undefined,
      trackValue,
    };
    const updated = addHabit(habit);
    setHabits(updated);
    setName(''); setTarget(''); setUnit(''); setTrackValue(false);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = deleteHabit(id);
    setHabits(updated);
  };

  const categories: Category[] = ['health', 'money', 'relationships', 'learning', 'work', 'growth'];

  const grouped = categories.map(cat => ({
    category: cat,
    habits: habits.filter(h => h.category === cat),
  })).filter(g => g.habits.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display text-foreground">Manage Habits</h1>
          <p className="text-muted-foreground mt-1">{habits.length} habits tracked</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showForm ? 'Cancel' : 'Add Habit'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl border border-border p-6 mb-6 overflow-hidden"
          >
            <h3 className="font-display text-foreground mb-4">New Habit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Habit name" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Target (e.g. 30 min)" value={target} onChange={e => setTarget(e.target.value)} />
              <Select value={category} onValueChange={v => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={frequency} onValueChange={v => setFrequency(v as Frequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-3">
                <Switch checked={trackValue} onCheckedChange={setTrackValue} />
                <span className="text-sm text-foreground">Track numeric value</span>
              </div>
              {trackValue && (
                <Input placeholder="Unit (e.g. minutes, pages)" value={unit} onChange={e => setUnit(e.target.value)} />
              )}
            </div>
            <Button onClick={handleAdd} className="mt-4">Add Habit</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {grouped.map(({ category: cat, habits: catHabits }) => (
          <div key={cat}>
            <h2 className="text-lg font-display text-foreground mb-3 flex items-center gap-2">
              <span>{CATEGORY_ICONS[cat]}</span> {CATEGORY_LABELS[cat]}
            </h2>
            <div className="space-y-2">
              {catHabits.map(habit => (
                <motion.div
                  key={habit.id}
                  layout
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
                >
                  <div>
                    <div className="font-medium text-foreground">{habit.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {habit.target} · {habit.frequency}
                      {habit.trackValue && habit.unit && ` · tracks ${habit.unit}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
