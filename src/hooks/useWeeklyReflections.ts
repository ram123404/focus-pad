import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfWeek, format } from 'date-fns';

export interface DbWeeklyReflection {
  id: string;
  user_id: string;
  week_start: string;
  wins: string;
  lessons: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function useWeeklyReflections() {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<DbWeeklyReflection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setReflections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weekly_reflections')
        .select('*')
        .order('week_start', { ascending: false });

      if (data) setReflections(data as DbWeeklyReflection[]);
      if (error) console.error('Error fetching reflections:', error);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getOrCreateWeeklyReflection = useCallback(async (weekStart?: Date) => {
    if (!user) return null;

    const targetWeekStart = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekStartStr = format(targetWeekStart, 'yyyy-MM-dd');

    const existing = reflections.find(r => r.week_start === weekStartStr);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('weekly_reflections')
      .insert({ week_start: weekStartStr, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating reflection:', error);
      return null;
    }

    setReflections(prev => [data as DbWeeklyReflection, ...prev]);
    return data as DbWeeklyReflection;
  }, [user, reflections]);

  const updateWeeklyReflection = useCallback(async (id: string, updates: Partial<DbWeeklyReflection>) => {
    const { data, error } = await supabase
      .from('weekly_reflections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reflection:', error);
      return null;
    }

    setReflections(prev => prev.map(r => r.id === id ? data as DbWeeklyReflection : r));
    return data as DbWeeklyReflection;
  }, []);

  return {
    reflections,
    loading,
    getOrCreateWeeklyReflection,
    updateWeeklyReflection,
    refetch: fetchData,
  };
}
