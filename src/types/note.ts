export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  isArchived: boolean;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  categories: string[];
}