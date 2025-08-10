import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, StickyNote, CheckSquare } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { NoteCard } from "./NoteCard";
import { TaskItem } from "./TaskItem";
import { NoteEditor } from "./NoteEditor";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { SearchAndFilter } from "./SearchAndFilter";
import { ThemeToggle } from "./ThemeToggle";
import { Note, Task, AppSettings } from "@/types/note";
import { useToast } from "@/hooks/use-toast";

export function NotesApp() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", []);
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [settings, setSettings] = useLocalStorage<AppSettings>("app-settings", {
    theme: 'light',
    categories: ['Personal', 'Work', 'Ideas']
  });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Personal");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'note' | 'task';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'note',
    id: '',
    title: ''
  });
  const { toast } = useToast();

  // Filter and search logic
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || note.category === selectedCategory;
      const matchesArchived = showArchived || !note.isArchived;
      const matchesPinned = !showPinnedOnly || note.isPinned;

      return matchesSearch && matchesCategory && matchesArchived && matchesPinned;
    }).sort((a, b) => {
      // Sort: pinned first, then by updated date
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery, selectedCategory, showArchived, showPinnedOnly]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.text.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
      const matchesArchived = showArchived || !task.isArchived;

      return matchesSearch && matchesCategory && matchesArchived;
    });
  }, [tasks, searchQuery, selectedCategory, showArchived]);

  // Note functions
  const createNote = () => {
    setEditingNote(null);
    setIsNoteEditorOpen(true);
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteEditorOpen(true);
  };

  const saveNote = (noteData: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();

    if (editingNote) {
      // Update existing note
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...noteData, updatedAt: now }
          : note
      ));
      toast({ title: "Note updated successfully" });
    } else {
      // Create new note
      const newNote: Note = {
        id: crypto.randomUUID(),
        ...noteData,
        createdAt: now,
        updatedAt: now,
      };
      setNotes(prev => [newNote, ...prev]);
      toast({ title: "Note created successfully" });
    }
  };

  const deleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'note',
      id,
      title: note?.title || 'Untitled Note'
    });
  };

  const confirmDeleteNote = () => {
    setNotes(prev => prev.filter(note => note.id !== deleteConfirm.id));
    toast({ title: "Note deleted", variant: "destructive" });
    setDeleteConfirm({ isOpen: false, type: 'note', id: '', title: '' });
  };

  const pinNote = (id: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
    const note = notes.find(n => n.id === id);
    toast({ title: note?.isPinned ? "Note unpinned" : "Note pinned" });
  };

  const archiveNote = (id: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, isArchived: !note.isArchived } : note
    ));
    const note = notes.find(n => n.id === id);
    toast({ title: note?.isArchived ? "Note restored" : "Note archived" });
  };

  // Task functions
  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: newTaskText.trim(),
        completed: false,
        category: newTaskCategory,
        isArchived: false,
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskText("");
      toast({ title: "Task added successfully" });
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const editTask = (id: string, text: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, text } : task
    ));
    toast({ title: "Task updated successfully" });
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'task',
      id,
      title: task?.text || 'Untitled Task'
    });
  };

  const confirmDeleteTask = () => {
    setTasks(prev => prev.filter(task => task.id !== deleteConfirm.id));
    toast({ title: "Task deleted", variant: "destructive" });
    setDeleteConfirm({ isOpen: false, type: 'task', id: '', title: '' });
  };

  const archiveTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, isArchived: !task.isArchived } : task
    ));
    const task = tasks.find(t => t.id === id);
    toast({ title: task?.isArchived ? "Task restored" : "Task archived" });
  };

  // Utility functions
  const handleTaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.type === 'note') {
      confirmDeleteNote();
    } else {
      confirmDeleteTask();
    }
  };

  // Export/Import functions
  const exportData = () => {
    const data = {
      notes,
      tasks,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-pad-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Data exported successfully" });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.notes) setNotes(data.notes);
        if (data.tasks) setTasks(data.tasks);
        if (data.settings) setSettings(data.settings);
        
        toast({ title: "Data imported successfully" });
      } catch (error) {
        toast({ title: "Failed to import data", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Focus Pad
            </h1>
            <p className="text-muted-foreground">
              Organize your thoughts and tasks in one beautiful place
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={settings.categories}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
          showPinnedOnly={showPinnedOnly}
          onTogglePinnedOnly={() => setShowPinnedOnly(!showPinnedOnly)}
          onExport={exportData}
          onImport={importData}
        />

        {/* Main Content */}
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted shadow-soft">
            <TabsTrigger 
              value="notes" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <StickyNote className="h-4 w-4" />
              Notes ({filteredNotes.length}/{notes.length})
            </TabsTrigger>
            <TabsTrigger 
              value="tasks"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CheckSquare className="h-4 w-4" />
              Tasks ({filteredTasks.filter(t => !t.completed).length}/{tasks.length})
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Notes</h2>
              <Button 
                onClick={createNote}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <StickyNote className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">
                  {notes.length === 0 ? "No notes yet" : "No notes match your filters"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {notes.length === 0 
                    ? "Create your first note to get started"
                    : "Try adjusting your search or filters"
                  }
                </p>
                <Button 
                  onClick={createNote}
                  variant="outline"
                  className="hover:bg-accent/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="group">
                    <NoteCard
                      note={note}
                      onEdit={editNote}
                      onDelete={deleteNote}
                      onPin={pinNote}
                      onArchive={archiveNote}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Tasks</h2>
            </div>

            {/* Add Task Input */}
            <div className="flex gap-3 mb-6">
              <Input
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleTaskKeyPress}
                className="flex-1 bg-background/50"
              />
              <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                <SelectTrigger className="w-32 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={addTask}
                disabled={!newTaskText.trim()}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">
                  {tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {tasks.length === 0 
                    ? "Add your first task to get organized"
                    : "Try adjusting your search or filters"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active Tasks */}
                {filteredTasks.filter(task => !task.completed).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onEdit={editTask}
                    onDelete={deleteTask}
                    onArchive={archiveTask}
                  />
                ))}
                
                {/* Completed Tasks */}
                {filteredTasks.filter(task => task.completed).length > 0 && (
                  <>
                    <div className="mt-8 mb-4">
                      <h3 className="text-lg font-medium text-muted-foreground">
                        Completed ({filteredTasks.filter(task => task.completed).length})
                      </h3>
                    </div>
                    {filteredTasks.filter(task => task.completed).map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onEdit={editTask}
                        onDelete={deleteTask}
                        onArchive={archiveTask}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Note Editor Modal */}
      <NoteEditor
        note={editingNote}
        isOpen={isNoteEditorOpen}
        onClose={() => setIsNoteEditorOpen(false)}
        onSave={saveNote}
        categories={settings.categories}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: 'note', id: '', title: '' })}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteConfirm.type === 'note' ? 'Note' : 'Task'}?`}
        description={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
      />
    </div>
  );
}