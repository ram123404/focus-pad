import { useState, useRef, useEffect } from 'react';
import { Plus, FileText, CheckSquare, Calendar, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { parseQuickInput } from '@/lib/parseInput';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface QuickAddProps {
  className?: string;
  autoFocus?: boolean;
  defaultType?: 'note' | 'task';
  onAdd?: () => void;
}

export function QuickAdd({ className, autoFocus, defaultType, onAdd }: QuickAddProps) {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseQuickInput> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { createNote, createTask, tags } = useApp();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (input.trim()) {
      const parsed = parseQuickInput(input);
      if (defaultType) {
        parsed.type = defaultType;
      }
      setPreview(parsed);
    } else {
      setPreview(null);
    }
  }, [input, defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !preview) return;

    if (preview.type === 'note') {
      createNote({
        title: preview.title,
        content: '',
        tags: preview.tags,
        isPinned: false,
        isArchived: false,
        isDailyNote: false,
        linkedNotes: [],
      });
      toast({
        title: 'Note created',
        description: preview.title,
      });
    } else {
      createTask({
        title: preview.title,
        dueDate: preview.dueDate || format(new Date(), 'yyyy-MM-dd'),
        priority: preview.priority || 'medium',
        status: 'todo',
        tags: preview.tags,
        isRecurring: false,
        isArchived: false,
      });
      toast({
        title: 'Task created',
        description: preview.title,
      });
    }

    setInput('');
    setPreview(null);
    onAdd?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInput('');
      setPreview(null);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Plus className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add task or note... (e.g., 'Buy groceries tomorrow high')"
            className="pl-10 pr-20 h-12 text-base bg-card border-border/50 focus:border-primary"
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={!input.trim()}
            className="absolute right-2"
          >
            Add
          </Button>
        </div>
      </form>

      {/* Preview */}
      {preview && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm animate-fade-in">
          {preview.type === 'note' ? (
            <FileText className="h-4 w-4 text-blue-500" />
          ) : (
            <CheckSquare className="h-4 w-4 text-green-500" />
          )}
          <span className="text-muted-foreground">
            {preview.type === 'note' ? 'Note' : 'Task'}:
          </span>
          <span className="font-medium truncate flex-1">{preview.title}</span>
          
          {preview.dueDate && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(preview.dueDate), 'MMM d')}
            </Badge>
          )}
          
          {preview.priority && (
            <Badge 
              variant={preview.priority === 'high' ? 'destructive' : 'secondary'}
              className="capitalize"
            >
              {preview.priority}
            </Badge>
          )}
          
          {preview.tags.map(tag => (
            <Badge key={tag} variant="outline" className="gap-1">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Hints */}
      {!preview && (
        <p className="text-xs text-muted-foreground px-1">
          <span className="font-medium">Tips:</span> Add "tomorrow" or "friday" for dates, "high" for priority, #tag for tags
        </p>
      )}
    </div>
  );
}
