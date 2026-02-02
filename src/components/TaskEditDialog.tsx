import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { DbTask } from '@/hooks/useSupabaseData';

interface TaskEditDialogProps {
  task: DbTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<DbTask>) => Promise<void>;
}

export function TaskEditDialog({ task, open, onOpenChange, onSave }: TaskEditDialogProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDueDate(task.due_date ? parseISO(task.due_date) : undefined);
      setPriority(task.priority as 'low' | 'medium' | 'high');
    }
  }, [task]);

  const handleSave = async () => {
    if (!task || !title.trim()) return;
    
    setSaving(true);
    try {
      await onSave(task.id, {
        title: title.trim(),
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        priority,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
