import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  CheckSquare, 
  Plus, 
  Zap,
  Archive,
  Settings,
  Search
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useApp } from '@/context/AppContext';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { notes, tasks, activeNotes } = useApp();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <Calendar className="mr-2 h-4 w-4" />
            Go to Today
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/notes'))}>
            <FileText className="mr-2 h-4 w-4" />
            Go to Notes
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/tasks'))}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Go to Tasks
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/focus'))}>
            <Zap className="mr-2 h-4 w-4" />
            Start Focus Mode
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/archive'))}>
            <Archive className="mr-2 h-4 w-4" />
            View Archive
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            Open Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/notes/new'))}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Note
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/tasks/new'))}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Task
          </CommandItem>
        </CommandGroup>

        {activeNotes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Notes">
              {activeNotes.slice(0, 5).map(note => (
                <CommandItem 
                  key={note.id}
                  onSelect={() => runCommand(() => navigate(`/notes/${note.id}`))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {note.title || 'Untitled'}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
