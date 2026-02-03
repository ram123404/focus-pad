import { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, parseISO } from 'date-fns';
import { BarChart3, Flame, Trophy, TrendingUp, ChevronLeft, ChevronRight, Calendar, Target, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useHabits } from '@/hooks/useHabits';
import { useWeeklyReflections } from '@/hooks/useWeeklyReflections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export function WeeklyReviewPage() {
  const { tasks, completedTasks } = useApp();
  const { habits, getCompletionsForWeek } = useHabits();
  const { getOrCreateWeeklyReflection, updateWeeklyReflection } = useWeeklyReflections();

  const [weekOffset, setWeekOffset] = useState(0);
  const [reflection, setReflection] = useState<{ id: string; wins: string; lessons: string; notes: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const weekStart = useMemo(() => startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);
  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

  const isCurrentWeek = weekOffset === 0;
  const weekLabel = isCurrentWeek ? 'This Week' : weekOffset === 1 ? 'Last Week' : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;

  // Load/create reflection for this week
  useEffect(() => {
    async function load() {
      const ref = await getOrCreateWeeklyReflection(weekStart);
      if (ref) setReflection({ id: ref.id, wins: ref.wins, lessons: ref.lessons, notes: ref.notes });
    }
    load();
  }, [weekStart, getOrCreateWeeklyReflection]);

  // Task stats for the week
  const weekTasks = useMemo(() => {
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

    const completed = tasks.filter(t => {
      if (!t.completed_at) return false;
      const completedDate = format(parseISO(t.completed_at), 'yyyy-MM-dd');
      return completedDate >= weekStartStr && completedDate <= weekEndStr;
    });

    const byPriority = {
      high: completed.filter(t => t.priority === 'high').length,
      medium: completed.filter(t => t.priority === 'medium').length,
      low: completed.filter(t => t.priority === 'low').length,
    };

    const byTag = completed.reduce((acc, t) => {
      (t.tags || []).forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return { total: completed.length, byPriority, byTag };
  }, [tasks, weekStart, weekEnd]);

  // Habit stats
  const habitStats = useMemo(() => {
    const weekCompletions = getCompletionsForWeek(weekEnd);
    const totalPossible = habits.length * 7;
    const totalCompleted = weekCompletions.reduce((sum, h) => sum + h.weekCompletions.filter(c => c.completed).length, 0);
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    const bestHabit = weekCompletions.length > 0
      ? weekCompletions.reduce((best, h) => {
          const count = h.weekCompletions.filter(c => c.completed).length;
          return count > best.count ? { habit: h.habit, count } : best;
        }, { habit: weekCompletions[0].habit, count: 0 })
      : null;

    return { totalCompleted, totalPossible, completionRate, weekCompletions, bestHabit };
  }, [habits, weekEnd, getCompletionsForWeek]);

  // Daily task completion trend
  const dailyTrend = useMemo(() => {
    return weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = tasks.filter(t => {
        if (!t.completed_at) return false;
        return format(parseISO(t.completed_at), 'yyyy-MM-dd') === dayStr;
      }).length;
      return { day: format(day, 'EEE'), count };
    });
  }, [tasks, weekDays]);

  const maxDailyTasks = Math.max(...dailyTrend.map(d => d.count), 1);

  const handleSaveReflection = async () => {
    if (!reflection) return;
    setSaving(true);
    await updateWeeklyReflection(reflection.id, {
      wins: reflection.wins,
      lessons: reflection.lessons,
      notes: reflection.notes,
    });
    setSaving(false);
    toast({ title: 'Reflection saved' });
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Weekly Review
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setWeekOffset(prev => prev + 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">{weekLabel}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
              disabled={isCurrentWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">{weekTasks.total}</div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  High Priority
                </span>
                <span className="font-medium">{weekTasks.byPriority.high}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  Medium Priority
                </span>
                <span className="font-medium">{weekTasks.byPriority.medium}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Low Priority
                </span>
                <span className="font-medium">{weekTasks.byPriority.low}</span>
              </div>
            </div>

            {Object.keys(weekTasks.byTag).length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">By Tag</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(weekTasks.byTag)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([tag, count]) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}: {count}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Habit Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Habit Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">{habitStats.completionRate}%</span>
              <span className="text-muted-foreground text-sm">completion rate</span>
            </div>

            <Progress value={habitStats.completionRate} className="h-2 mb-4" />

            <p className="text-sm text-muted-foreground mb-3">
              {habitStats.totalCompleted} of {habitStats.totalPossible} possible completions
            </p>

            {habitStats.bestHabit && habitStats.bestHabit.count > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Best This Week</p>
                <p className="font-medium flex items-center gap-2">
                  <span>{habitStats.bestHabit.habit.icon}</span>
                  {habitStats.bestHabit.habit.name}
                  <Badge variant="outline" className="text-xs">
                    {habitStats.bestHabit.count}/7 days
                  </Badge>
                </p>
              </div>
            )}

            {habits.length > 0 && (
              <div className="mt-4 space-y-2">
                {habits.slice(0, 3).map(habit => (
                  <div key={habit.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{habit.icon}</span>
                      {habit.name}
                    </span>
                    <span className="text-muted-foreground">
                      {habit.currentStreak > 0 && (
                        <span className="text-orange-500 flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {habit.currentStreak}d
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Productivity Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Productivity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {dailyTrend.map(({ day, count }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all"
                    style={{ height: `${(count / maxDailyTasks) * 100}%`, minHeight: count > 0 ? '8px' : '2px' }}
                  />
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Tasks completed per day
            </div>
          </CardContent>
        </Card>

        {/* Longest Streaks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Streak Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add habits to see streak records</p>
            ) : (
              <div className="space-y-3">
                {habits
                  .filter(h => h.longestStreak > 0)
                  .sort((a, b) => b.longestStreak - a.longestStreak)
                  .slice(0, 5)
                  .map(habit => (
                    <div key={habit.id} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <span>{habit.icon}</span>
                        {habit.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Best: {habit.longestStreak}d
                        </Badge>
                        {habit.currentStreak > 0 && (
                          <Badge className="text-xs bg-orange-500">
                            Now: {habit.currentStreak}d
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                {habits.every(h => h.longestStreak === 0) && (
                  <p className="text-sm text-muted-foreground">Complete habits to build streaks!</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wins & Lessons */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-500" />
              Wins This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reflection?.wins || ''}
              onChange={(e) => setReflection(prev => prev ? { ...prev, wins: e.target.value } : null)}
              placeholder="What went well this week? What are you proud of?"
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Lessons Learned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reflection?.lessons || ''}
              onChange={(e) => setReflection(prev => prev ? { ...prev, lessons: e.target.value } : null)}
              placeholder="What challenges did you face? What would you do differently?"
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveReflection} disabled={saving || !reflection}>
          {saving ? 'Saving...' : 'Save Reflection'}
        </Button>
      </div>
    </div>
  );
}
