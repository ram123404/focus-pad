import { useState } from 'react';
import { CheckCircle2, Circle, Calendar, Flag, Pencil, Trash2, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DbTask } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface TaskCardProps {
  task: DbTask;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  compact?: boolean;
}

export function TaskCard({ task, onToggle, onEdit, onDelete, onArchive, compact }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatDueDate = (date: string) => {
    const d = parseISO(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d');
  };

  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) && task.status !== 'done';

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
        "hover:bg-accent/50 border border-transparent hover:border-border",
        task.status === 'done' && "opacity-60"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          "flex-shrink-0 mt-0.5 transition-colors",
          task.status === 'done' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
        )}
      >
        {task.status === 'done' ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium leading-snug",
          task.status === 'done' && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>

        {!compact && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.due_date && (
              <span className={cn(
                "text-xs flex items-center gap-1",
                isOverdue ? "text-red-500" : "text-muted-foreground"
              )}>
                <Calendar className="h-3 w-3" />
                {formatDueDate(task.due_date)}
              </span>
            )}

            {task.priority !== 'medium' && (
              <Badge variant="secondary" className={cn("text-xs h-5 px-1.5", getPriorityColor(task.priority))}>
                <Flag className="h-3 w-3 mr-1" />
                {task.priority}
              </Badge>
            )}

            {task.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs h-5">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center gap-1 transition-opacity",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        {onEdit && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {onArchive && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onArchive}>
            <Archive className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
