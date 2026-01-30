import { useState } from 'react';
import { Archive, FileText, CheckSquare, Trash2, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export function ArchivePage() {
  const { archivedNotes, archivedTasks, updateNote, updateTask, deleteNote, deleteTask } = useApp();
  const [activeTab, setActiveTab] = useState('notes');

  const handleRestoreNote = async (id: string) => {
    await updateNote(id, { is_archived: false });
    toast({ title: 'Note restored' });
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Delete this note permanently?')) {
      await deleteNote(id);
      toast({ title: 'Note deleted permanently' });
    }
  };

  const handleRestoreTask = async (id: string) => {
    await updateTask(id, { is_archived: false });
    toast({ title: 'Task restored' });
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Delete this task permanently?')) {
      await deleteTask(id);
      toast({ title: 'Task deleted permanently' });
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Archive className="h-6 w-6" />
          Archive
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Archived items can be restored or permanently deleted
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            Notes ({archivedNotes.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks ({archivedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          {archivedNotes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto opacity-20 mb-4" />
              <p>No archived notes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedNotes.map(note => (
                <Card key={note.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{note.title || 'Untitled'}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {note.content || 'No content'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {note.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            Archived {format(new Date(note.updated_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreNote(note.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          {archivedTasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto opacity-20 mb-4" />
              <p>No archived tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedTasks.map(task => (
                <Card key={task.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-medium truncate",
                          task.status === 'done' && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {task.priority}
                          </Badge>
                          {task.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            Archived {format(new Date(task.updated_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreTask(task.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
