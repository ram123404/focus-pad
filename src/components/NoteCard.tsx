import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Pin, Archive, ArchiveRestore } from "lucide-react";
import { Note } from "@/types/note";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete, onPin, onArchive }: NoteCardProps) {
  return (
    <Card className={`p-6 shadow-card hover:shadow-lg transition-all duration-200 bg-gradient-subtle border-0 ${
      note.isPinned ? 'ring-2 ring-primary/20' : ''
    } ${note.isArchived ? 'opacity-75' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-foreground line-clamp-2">
              {note.title || "Untitled Note"}
            </h3>
            {note.isPinned && (
              <Pin className="h-4 w-4 text-primary fill-current" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {note.category}
            </Badge>
            {note.isArchived && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Archived
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPin(note.id)}
            className={`hover:bg-accent/50 ${note.isPinned ? 'text-primary' : ''}`}
          >
            <Pin className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note)}
            className="hover:bg-accent/50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(note.id)}
            className="hover:bg-accent/50"
          >
            {note.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-muted-foreground text-sm mb-4">
        {new Date(note.updatedAt).toLocaleDateString()}
      </div>
      
      <div className="text-foreground/80 max-h-32 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {note.content || "No content"}
        </ReactMarkdown>
      </div>
    </Card>
  );
}