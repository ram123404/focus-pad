import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Flame, Plus, X, Check } from 'lucide-react';
import { useHabits, HabitWithStreak } from '@/hooks/useHabits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface HabitTrackerProps {
  compact?: boolean;
}

export function HabitTracker({ compact = false }: HabitTrackerProps) {
  const { habits, loading, createHabit, deleteHabit, toggleHabitCompletion } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [adding, setAdding] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    setAdding(true);
    const result = await createHabit(newHabitName.trim());
    if (result) {
      toast({ title: `Habit "${newHabitName}" created` });
      setNewHabitName('');
      setShowAdd(false);
    }
    setAdding(false);
  };

  const handleToggle = async (habit: HabitWithStreak) => {
    const result = await toggleHabitCompletion(habit.id);
    if (result?.added && !habit.completedToday) {
      if (habit.currentStreak >= 2) {
        toast({ title: `🔥 ${habit.currentStreak + 1} day streak!` });
      } else {
        toast({ title: `${habit.name} completed!` });
      }
    }
  };

  const handleDelete = async (habit: HabitWithStreak) => {
    if (!confirm(`Delete habit "${habit.name}"?`)) return;
    await deleteHabit(habit.id);
    toast({ title: 'Habit deleted' });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading habits...
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Habits
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No habits yet</p>
          ) : (
            <div className="space-y-2">
              {habits.map(habit => (
                <button
                  key={habit.id}
                  onClick={() => handleToggle(habit)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors text-left",
                    habit.completedToday
                      ? "bg-primary/10 border-primary/30"
                      : "hover:bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.icon}</span>
                    <span className={cn("text-sm", habit.completedToday && "line-through text-muted-foreground")}>
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {habit.currentStreak > 0 && (
                      <span className="text-xs text-orange-500 flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {habit.currentStreak}
                      </span>
                    )}
                    {habit.completedToday && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Daily Habits
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {showAdd && (
          <div className="flex gap-2 mb-4">
            <Input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="New habit name..."
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
              disabled={adding}
            />
            <Button size="sm" onClick={handleAddHabit} disabled={adding || !newHabitName.trim()}>
              Add
            </Button>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Flame className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No habits yet</p>
            <p className="text-xs">Add your first habit to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header row with days */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground pl-[140px]">
              {last7Days.map(date => (
                <div key={date} className="w-6 text-center">
                  {format(new Date(date), 'E').charAt(0)}
                </div>
              ))}
            </div>

            {/* Habit rows */}
            {habits.map(habit => (
              <div key={habit.id} className="flex items-center gap-2 group">
                <div className="flex items-center gap-2 w-[140px] flex-shrink-0">
                  <span className="text-lg">{habit.icon}</span>
                  <span className="text-sm truncate flex-1">{habit.name}</span>
                  {habit.currentStreak > 0 && (
                    <span className="text-xs text-orange-500 flex items-center gap-0.5">
                      <Flame className="h-3 w-3" />
                      {habit.currentStreak}
                    </span>
                  )}
                </div>

                <div className="flex gap-1">
                  {last7Days.map(date => {
                    const isCompleted = habit.completions.includes(date);
                    const isToday = date === today;

                    return (
                      <button
                        key={date}
                        onClick={() => toggleHabitCompletion(habit.id, date)}
                        className={cn(
                          "w-6 h-6 rounded border transition-all",
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : isToday
                              ? "border-primary/50 hover:bg-primary/10"
                              : "border-border hover:bg-muted"
                        )}
                      >
                        {isCompleted && <Check className="h-3 w-3 mx-auto" />}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(habit)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
