import { useState, useEffect, useCallback } from 'react';
import { Note, Task, Tag, AppSettings, defaultSettings, defaultTags } from '@/types';
import { format } from 'date-fns';

const STORAGE_KEYS = {
  notes: 'productivity-notes',
  tasks: 'productivity-tasks',
  tags: 'productivity-tags',
  settings: 'productivity-settings',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function useAppState() {
  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage(STORAGE_KEYS.notes, []));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage(STORAGE_KEYS.tasks, []));
  const [tags, setTags] = useState<Tag[]>(() => loadFromStorage(STORAGE_KEYS.tags, defaultTags));
  const [settings, setSettings] = useState<AppSettings>(() => loadFromStorage(STORAGE_KEYS.settings, defaultSettings));

  // Persist changes
  useEffect(() => { saveToStorage(STORAGE_KEYS.notes, notes); }, [notes]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.tasks, tasks); }, [tasks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.tags, tags); }, [tags]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.settings, settings); }, [settings]);

  // Note operations
  const createNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const archiveNote = useCallback((id: string) => {
    updateNote(id, { isArchived: true });
  }, [updateNote]);

  const getDailyNote = useCallback((date: string) => {
    return notes.find(n => n.isDailyNote && n.dailyNoteDate === date);
  }, [notes]);

  const getOrCreateDailyNote = useCallback((date: string) => {
    const existing = getDailyNote(date);
    if (existing) return existing;
    
    return createNote({
      title: format(new Date(date), 'EEEE, MMMM d, yyyy'),
      content: '',
      tags: [],
      isPinned: false,
      isArchived: false,
      isDailyNote: true,
      dailyNoteDate: date,
      linkedNotes: [],
    });
  }, [getDailyNote, createNote]);

  // Task operations
  const createTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id 
        ? { 
            ...task, 
            status: task.status === 'done' ? 'todo' : 'done',
            completedAt: task.status === 'todo' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString() 
          } 
        : task
    ));
  }, []);

  const archiveTask = useCallback((id: string) => {
    updateTask(id, { isArchived: true });
  }, [updateTask]);

  // Tag operations
  const createTag = useCallback((name: string, color: string) => {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      color,
    };
    setTags(prev => [...prev, newTag]);
    return newTag;
  }, []);

  const deleteTag = useCallback((id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Computed values
  const todaysTasks = tasks.filter(t => {
    if (t.isArchived || t.status === 'done') return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    return t.dueDate === today;
  });

  const overdueTasks = tasks.filter(t => {
    if (t.isArchived || t.status === 'done') return false;
    if (!t.dueDate) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    return t.dueDate < today;
  });

  const upcomingTasks = tasks.filter(t => {
    if (t.isArchived || t.status === 'done') return false;
    if (!t.dueDate) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    return t.dueDate > today;
  });

  const completedTasks = tasks.filter(t => t.status === 'done' && !t.isArchived);

  const priorityTasks = tasks
    .filter(t => !t.isArchived && t.status === 'todo' && t.priority === 'high')
    .slice(0, 3);

  const activeNotes = notes.filter(n => !n.isArchived);
  const archivedNotes = notes.filter(n => n.isArchived);
  const archivedTasks = tasks.filter(t => t.isArchived);

  return {
    // State
    notes,
    tasks,
    tags,
    settings,
    
    // Computed
    todaysTasks,
    overdueTasks,
    upcomingTasks,
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
  };
}
