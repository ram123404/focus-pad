import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format } from 'date-fns';

// Types matching the database schema
export interface DbNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  is_daily_note: boolean;
  daily_note_date: string | null;
  linked_notes: string[];
  created_at: string;
  updated_at: string;
}

export interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'done';
  tags: string[];
  is_recurring: boolean;
  recurring_pattern: 'daily' | 'weekly' | 'monthly' | null;
  linked_note_id: string | null;
  is_archived: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DbUserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  default_view: 'today' | 'notes' | 'tasks';
  font_size: 'small' | 'medium' | 'large';
  font_family: 'system' | 'serif' | 'mono';
  sidebar_collapsed: boolean;
  pomodoro_work_minutes: number;
  pomodoro_break_minutes: number;
  created_at: string;
  updated_at: string;
}

export function useSupabaseData() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<DbNote[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [tags, setTags] = useState<DbTag[]>([]);
  const [settings, setSettings] = useState<DbUserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setTasks([]);
      setTags([]);
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [notesRes, tasksRes, tagsRes, settingsRes] = await Promise.all([
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('tags').select('*').order('name'),
        supabase.from('user_settings').select('*').maybeSingle(),
      ]);

      if (notesRes.data) setNotes(notesRes.data as DbNote[]);
      if (tasksRes.data) setTasks(tasksRes.data as DbTask[]);
      if (tagsRes.data) setTags(tagsRes.data as DbTag[]);
      if (settingsRes.data) setSettings(settingsRes.data as DbUserSettings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Note operations
  const createNote = useCallback(async (note: Omit<DbNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('notes')
      .insert({ ...note, user_id: user.id })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating note:', error);
      return null;
    }
    
    setNotes(prev => [data as DbNote, ...prev]);
    return data as DbNote;
  }, [user]);

  const updateNote = useCallback(async (id: string, updates: Partial<DbNote>) => {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating note:', error);
      return null;
    }
    
    setNotes(prev => prev.map(n => n.id === id ? data as DbNote : n));
    return data as DbNote;
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }
    
    setNotes(prev => prev.filter(n => n.id !== id));
    return true;
  }, []);

  const archiveNote = useCallback(async (id: string) => {
    return updateNote(id, { is_archived: true });
  }, [updateNote]);

  const getDailyNote = useCallback((date: string) => {
    return notes.find(n => n.is_daily_note && n.daily_note_date === date);
  }, [notes]);

  const getOrCreateDailyNote = useCallback(async (date: string) => {
    const existing = getDailyNote(date);
    if (existing) return existing;
    
    return createNote({
      title: format(new Date(date), 'EEEE, MMMM d, yyyy'),
      content: '',
      tags: [],
      is_pinned: false,
      is_archived: false,
      is_daily_note: true,
      daily_note_date: date,
      linked_notes: [],
    });
  }, [getDailyNote, createNote]);

  // Task operations
  const createTask = useCallback(async (task: Omit<DbTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return null;
    }
    
    setTasks(prev => [data as DbTask, ...prev]);
    return data as DbTask;
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<DbTask>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      return null;
    }
    
    setTasks(prev => prev.map(t => t.id === id ? data as DbTask : t));
    return data as DbTask;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }
    
    setTasks(prev => prev.filter(t => t.id !== id));
    return true;
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return null;
    
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const completedAt = newStatus === 'done' ? new Date().toISOString() : null;
    
    return updateTask(id, { status: newStatus, completed_at: completedAt });
  }, [tasks, updateTask]);

  const archiveTask = useCallback(async (id: string) => {
    return updateTask(id, { is_archived: true });
  }, [updateTask]);

  // Tag operations
  const createTag = useCallback(async (name: string, color: string) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('tags')
      .insert({ name: name.toLowerCase().replace(/[^a-z0-9]/g, ''), color, user_id: user.id })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating tag:', error);
      return null;
    }
    
    setTags(prev => [...prev, data as DbTag]);
    return data as DbTag;
  }, [user]);

  const deleteTag = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
    
    setTags(prev => prev.filter(t => t.id !== id));
    return true;
  }, []);

  // Settings operations
  const updateSettings = useCallback(async (updates: Partial<DbUserSettings>) => {
    if (!settings) return null;
    
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('id', settings.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating settings:', error);
      return null;
    }
    
    setSettings(data as DbUserSettings);
    return data as DbUserSettings;
  }, [settings]);

  // Computed values
  const todaysTasks = tasks.filter(t => {
    if (t.is_archived || t.status === 'done') return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    return t.due_date === today;
  });

  const overdueTasks = tasks.filter(t => {
    if (t.is_archived || t.status === 'done') return false;
    if (!t.due_date) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    return t.due_date < today;
  });

  const upcomingTasks = tasks.filter(t => {
    if (t.is_archived || t.status === 'done') return false;
    if (!t.due_date) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    return t.due_date > today;
  });

  const unscheduledTasks = tasks.filter(t => {
    if (t.is_archived || t.status === 'done') return false;
    return !t.due_date;
  });

  const completedTasks = tasks.filter(t => t.status === 'done' && !t.is_archived);

  const priorityTasks = tasks
    .filter(t => !t.is_archived && t.status === 'todo' && t.priority === 'high')
    .slice(0, 3);

  const activeNotes = notes.filter(n => !n.is_archived);
  const archivedNotes = notes.filter(n => n.is_archived);
  const archivedTasks = tasks.filter(t => t.is_archived);

  return {
    // State
    notes,
    tasks,
    tags,
    settings,
    loading,
    
    // Computed
    todaysTasks,
    overdueTasks,
    upcomingTasks,
    unscheduledTasks,
    completedTasks,
    priorityTasks,
    activeNotes,
    archivedNotes,
    archivedTasks,
    
    // Note operations
    createNote,
    updateNote,
    deleteNote,
    archiveNote,
    getDailyNote,
    getOrCreateDailyNote,
    
    // Task operations
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    archiveTask,
    
    // Tag operations
    createTag,
    deleteTag,
    
    // Settings
    updateSettings,
    
    // Refresh
    refetch: fetchData,
  };
}
