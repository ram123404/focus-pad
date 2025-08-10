import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card className="p-6 shadow-card hover:shadow-lg transition-all duration-200 bg-gradient-subtle border-0">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-foreground line-clamp-2">
          {note.title || "Untitled Note"}
        </h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
      
      <div className="text-foreground/80 max-h-32 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {note.content || "No content"}
      </div>
    </Card>
  );
}