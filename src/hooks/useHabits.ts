import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, subDays, differenceInDays, parseISO, startOfDay } from 'date-fns';

export interface DbHabit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbHabitCompletion {
  id: string;
  user_id: string;
  habit_id: string;
  completed_date: string;
  created_at: string;
}

export interface HabitWithStreak extends DbHabit {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  completions: string[]; // dates in YYYY-MM-DD format
}

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<DbHabit[]>([]);
  const [completions, setCompletions] = useState<DbHabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setCompletions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [habitsRes, completionsRes] = await Promise.all([
        supabase.from('habits').select('*').eq('is_archived', false).order('created_at'),
        supabase.from('habit_completions').select('*').order('completed_date', { ascending: false }),
      ]);

      if (habitsRes.data) setHabits(habitsRes.data as DbHabit[]);
      if (completionsRes.data) setCompletions(completionsRes.data as DbHabitCompletion[]);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateStreak = useCallback((habitCompletions: string[]): { current: number; longest: number } => {
    if (habitCompletions.length === 0) return { current: 0, longest: 0 };

    const sortedDates = [...habitCompletions].sort((a, b) => b.localeCompare(a));
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    // Calculate streaks
    const allDates = [...habitCompletions].sort((a, b) => a.localeCompare(b));
    
    for (const dateStr of allDates) {
      const date = startOfDay(parseISO(dateStr));
      
      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const diff = differenceInDays(date, lastDate);
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          longest = Math.max(longest, tempStreak);
          tempStreak = 1;
        }
      }
      lastDate = date;
    }
    longest = Math.max(longest, tempStreak);

    // Calculate current streak (must include today or yesterday)
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
      const startFrom = sortedDates.includes(today) ? today : yesterday;
      let checkDate = startFrom;
      
      while (sortedDates.includes(checkDate)) {
        current++;
        checkDate = format(subDays(parseISO(checkDate), 1), 'yyyy-MM-dd');
      }
    }

    return { current, longest };
  }, []);

  const habitsWithStreaks = habits.map(habit => {
    const habitCompletions = completions
      .filter(c => c.habit_id === habit.id)
      .map(c => c.completed_date);
    
    const { current, longest } = calculateStreak(habitCompletions);
    const today = format(new Date(), 'yyyy-MM-dd');

    return {
      ...habit,
      currentStreak: current,
      longestStreak: longest,
      completedToday: habitCompletions.includes(today),
      completions: habitCompletions,
    } as HabitWithStreak;
  });

  const createHabit = useCallback(async (name: string, icon = '✓', color = 'hsl(220, 70%, 50%)') => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('habits')
      .insert({ name, icon, color, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      return null;
    }

    setHabits(prev => [...prev, data as DbHabit]);
    return data as DbHabit;
  }, [user]);

  const deleteHabit = useCallback(async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
    setHabits(prev => prev.filter(h => h.id !== id));
    return true;
  }, []);

  const toggleHabitCompletion = useCallback(async (habitId: string, date?: string) => {
    if (!user) return null;

    const targetDate = date || format(new Date(), 'yyyy-MM-dd');
    const existing = completions.find(c => c.habit_id === habitId && c.completed_date === targetDate);

    if (existing) {
      const { error } = await supabase.from('habit_completions').delete().eq('id', existing.id);
      if (error) {
        console.error('Error removing completion:', error);
        return null;
      }
      setCompletions(prev => prev.filter(c => c.id !== existing.id));
      return { removed: true };
    } else {
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({ habit_id: habitId, completed_date: targetDate, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error adding completion:', error);
        return null;
      }
      setCompletions(prev => [data as DbHabitCompletion, ...prev]);
      return { added: true, data };
    }
  }, [user, completions]);

  const getCompletionsForWeek = useCallback((startDate: Date) => {
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push(format(subDays(startDate, 6 - i), 'yyyy-MM-dd'));
    }

    return habitsWithStreaks.map(habit => ({
      habit,
      weekCompletions: weekDates.map(date => ({
        date,
        completed: habit.completions.includes(date),
      })),
    }));
  }, [habitsWithStreaks]);

  return {
    habits: habitsWithStreaks,
    loading,
    createHabit,
    deleteHabit,
    toggleHabitCompletion,
    getCompletionsForWeek,
    refetch: fetchData,
  };
}
