// Core Types for Productivity App

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDailyNote: boolean;
  dailyNoteDate?: string; // YYYY-MM-DD format for daily notes
  linkedNotes: string[]; // IDs of linked notes via [[Note Name]]
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'done';
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  linkedNoteId?: string;
  isArchived: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'today' | 'notes' | 'tasks';
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'system' | 'serif' | 'mono';
  sidebarCollapsed: boolean;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  type: 'work' | 'break';
}

// Quick Add parsed result
export interface ParsedInput {
  type: 'note' | 'task';
  title: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  tags: string[];
}

// App State
export interface AppState {
  notes: Note[];
  tasks: Task[];
  tags: Tag[];
  settings: AppSettings;
  focusSessions: FocusSession[];
}

// Default values
export const defaultSettings: AppSettings = {
  theme: 'system',
  defaultView: 'today',
  fontSize: 'medium',
  fontFamily: 'system',
  sidebarCollapsed: false,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
};

export const defaultTags: Tag[] = [
  { id: '1', name: 'work', color: 'hsl(220, 70%, 50%)' },
  { id: '2', name: 'personal', color: 'hsl(280, 70%, 50%)' },
  { id: '3', name: 'study', color: 'hsl(140, 70%, 40%)' },
  { id: '4', name: 'health', color: 'hsl(0, 70%, 50%)' },
];
