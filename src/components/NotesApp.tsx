import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, StickyNote, CheckSquare } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { NoteCard } from "./NoteCard";
import { TaskItem } from "./TaskItem";
import { NoteEditor } from "./NoteEditor";
import { Note, Task } from "@/types/note";
import { useToast } from "@/hooks/use-toast";

export function NotesApp() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", []);
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const { toast } = useToast();

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
    setNotes(prev => prev.filter(note => note.id !== id));
    toast({ title: "Note deleted", variant: "destructive" });
  };

  // Task functions
  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: newTaskText.trim(),
        completed: false,
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
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({ title: "Task deleted", variant: "destructive" });
  };

  const handleTaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Focus Pad
          </h1>
          <p className="text-muted-foreground">
            Organize your thoughts and tasks in one beautiful place
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted shadow-soft">
            <TabsTrigger 
              value="notes" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <StickyNote className="h-4 w-4" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger 
              value="tasks"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CheckSquare className="h-4 w-4" />
              Tasks ({tasks.filter(t => !t.completed).length})
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

            {notes.length === 0 ? (
              <div className="text-center py-12">
                <StickyNote className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No notes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first note to get started
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
                {notes.map((note) => (
                  <div key={note.id} className="group">
                    <NoteCard
                      note={note}
                      onEdit={editNote}
                      onDelete={deleteNote}
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
              <Button 
                onClick={addTask}
                disabled={!newTaskText.trim()}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first task to get organized
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active Tasks */}
                {tasks.filter(task => !task.completed).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onEdit={editTask}
                    onDelete={deleteTask}
                  />
                ))}
                
                {/* Completed Tasks */}
                {tasks.filter(task => task.completed).length > 0 && (
                  <>
                    <div className="mt-8 mb-4">
                      <h3 className="text-lg font-medium text-muted-foreground">
                        Completed ({tasks.filter(task => task.completed).length})
                      </h3>
                    </div>
                    {tasks.filter(task => task.completed).map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onEdit={editTask}
                        onDelete={deleteTask}
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
      />
    </div>
  );
}