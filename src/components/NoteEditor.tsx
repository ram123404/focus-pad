import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, X } from "lucide-react";
import { Note } from "@/types/note";

interface NoteEditorProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  categories: string[];
}

export function NoteEditor({ note, isOpen, onClose, onSave, categories }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
    } else {
      setTitle("");
      setContent("");
      setCategory("Personal");
    }
  }, [note]);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      onSave({
        title: title.trim(),
        content: content.trim(),
        category,
        isPinned: note?.isPinned || false,
        isArchived: note?.isArchived || false,
      });
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] bg-gradient-subtle border-0 shadow-card flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {note ? "Edit Note" : "Create New Note"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium bg-background/50 flex-shrink-0"
            autoFocus
          />

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-background/50 flex-shrink-0">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Textarea
            placeholder="Start writing your note... You can use **markdown** formatting!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 resize-none bg-background/50 min-h-0"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 flex-shrink-0 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-accent/50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}