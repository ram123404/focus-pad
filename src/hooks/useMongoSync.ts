import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note, Task, Tag, AppSettings } from '@/types';

interface MongoSyncOptions {
  onError?: (error: Error) => void;
}

export function useMongoSync(options: MongoSyncOptions = {}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const mongoRequest = useCallback(async (
    action: string,
    collection: string,
    data?: any,
    id?: string,
    query?: any
  ) => {
    const { data: result, error } = await supabase.functions.invoke('mongodb-sync', {
      body: { action, collection, data, id, query },
    });

    if (error) {
      console.error('MongoDB sync error:', error);
      options.onError?.(new Error(error.message));
      throw error;
    }

    return result;
  }, [options]);

  // Notes operations
  const fetchNotes = useCallback(async (): Promise<Note[]> => {
    const result = await mongoRequest('findAll', 'notes');
    return result.map((doc: any) => ({
      ...doc,
      id: doc._id?.toString() || doc.id,
    }));
  }, [mongoRequest]);

  const saveNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const result = await mongoRequest('insertOne', 'notes', note);
    return { ...result, id: result._id };
  }, [mongoRequest]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>): Promise<Note> => {
    const result = await mongoRequest('updateOne', 'notes', updates, id);
    return { ...result, id: result._id };
  }, [mongoRequest]);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    await mongoRequest('deleteOne', 'notes', undefined, id);
  }, [mongoRequest]);

  // Tasks operations
  const fetchTasks = useCallback(async (): Promise<Task[]> => {
    const result = await mongoRequest('findAll', 'tasks');
    return result.map((doc: any) => ({
      ...doc,
      id: doc._id?.toString() || doc.id,
    }));
  }, [mongoRequest]);

  const saveTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const result = await mongoRequest('insertOne', 'tasks', task);
    return { ...result, id: result._id };
  }, [mongoRequest]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<Task> => {
    const result = await mongoRequest('updateOne', 'tasks', updates, id);
    return { ...result, id: result._id };
  }, [mongoRequest]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await mongoRequest('deleteOne', 'tasks', undefined, id);
  }, [mongoRequest]);

  // Tags operations
  const fetchTags = useCallback(async (): Promise<Tag[]> => {
    const result = await mongoRequest('findAll', 'tags');
    return result.map((doc: any) => ({
      ...doc,
      id: doc._id?.toString() || doc.id,
    }));
  }, [mongoRequest]);

  const saveTag = useCallback(async (tag: Omit<Tag, 'id'>): Promise<Tag> => {
    const result = await mongoRequest('insertOne', 'tags', tag);
    return { ...result, id: result._id };
  }, [mongoRequest]);

  const deleteTag = useCallback(async (id: string): Promise<void> => {
    await mongoRequest('deleteOne', 'tags', undefined, id);
  }, [mongoRequest]);

  // Settings operations
  const fetchSettings = useCallback(async (): Promise<AppSettings | null> => {
    const result = await mongoRequest('findAll', 'settings');
    if (result.length > 0) {
      const doc = result[0];
      return { ...doc, id: undefined, _id: undefined };
    }
    return null;
  }, [mongoRequest]);

  const saveSettings = useCallback(async (settings: AppSettings): Promise<void> => {
    const existing = await mongoRequest('findAll', 'settings');
    if (existing.length > 0) {
      await mongoRequest('updateOne', 'settings', settings, existing[0]._id);
    } else {
      await mongoRequest('insertOne', 'settings', settings);
    }
  }, [mongoRequest]);

  // Sync all data
  const syncToMongo = useCallback(async (
    notes: Note[],
    tasks: Task[],
    tags: Tag[],
    settings: AppSettings
  ) => {
    setIsSyncing(true);
    try {
      // Use bulk operations for better performance
      await Promise.all([
        mongoRequest('bulkWrite', 'notes', { notes }),
        mongoRequest('bulkWrite', 'tasks', { notes: tasks }),
        mongoRequest('bulkWrite', 'tags', { notes: tags }),
        saveSettings(settings),
      ]);
      setLastSyncTime(new Date().toISOString());
      console.log('Data synced to MongoDB');
    } finally {
      setIsSyncing(false);
    }
  }, [mongoRequest, saveSettings]);

  return {
    isSyncing,
    lastSyncTime,
    // Notes
    fetchNotes,
    saveNote,
    updateNote,
    deleteNote,
    // Tasks
    fetchTasks,
    saveTask,
    updateTask,
    deleteTask,
    // Tags
    fetchTags,
    saveTag,
    deleteTag,
    // Settings
    fetchSettings,
    saveSettings,
    // Bulk sync
    syncToMongo,
  };
}
