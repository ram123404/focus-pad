import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Pin, Trash2, Archive, Tag, Link2, Clock, Save } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyReflection } from '@/components/DailyReflection';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, updateNote, deleteNote, archiveNote, activeNotes } = useApp();
  const note = notes.find(n => n.id === id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Reflection state for daily notes
  const [reflectionGratitude, setReflectionGratitude] = useState('');
  const [reflectionAccomplishment, setReflectionAccomplishment] = useState('');
  const [reflectionImprovement, setReflectionImprovement] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      // Load reflection data for daily notes
      setReflectionGratitude((note as any).reflection_gratitude || '');
      setReflectionAccomplishment((note as any).reflection_accomplishment || '');
      setReflectionImprovement((note as any).reflection_improvement || '');
    }
  }, [note]);

  useEffect(() => {
    if (!note || !hasChanges) return;
    const timer = setTimeout(() => { updateNote(note.id, { title, content }); setHasChanges(false); }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, note, hasChanges, updateNote]);

  const handleTitleChange = (value: string) => { setTitle(value); setHasChanges(true); };
  const handleContentChange = (value: string) => { setContent(value); setHasChanges(true); };

  const handleReflectionUpdate = useCallback((field: 'reflection_gratitude' | 'reflection_accomplishment' | 'reflection_improvement', value: string) => {
    if (!note) return;

    if (field === 'reflection_gratitude') setReflectionGratitude(value);
    else if (field === 'reflection_accomplishment') setReflectionAccomplishment(value);
    else setReflectionImprovement(value);

    // Debounced save
    const updates = { [field]: value };
    updateNote(note.id, updates as any);
  }, [note, updateNote]);

  const linkedNoteNames = useMemo(() => {
    const matches = content.match(/\[\[([^\]]+)\]\]/g);
    return matches ? matches.map(m => m.slice(2, -2)) : [];
  }, [content]);

  const backlinks = useMemo(() => {
    if (!note) return [];
    return activeNotes.filter(n => n.id !== note.id && n.content.includes(`[[${note.title}]]`));
  }, [activeNotes, note]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && note) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!note.tags?.includes(newTag)) { updateNote(note.id, { tags: [...(note.tags || []), newTag] }); toast({ title: `Tag #${newTag} added` }); }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => { if (note) updateNote(note.id, { tags: (note.tags || []).filter(t => t !== tag) }); };
  const handlePin = () => { if (note) { updateNote(note.id, { is_pinned: !note.is_pinned }); toast({ title: note.is_pinned ? 'Note unpinned' : 'Note pinned' }); } };
  const handleArchive = () => { if (note) { archiveNote(note.id); toast({ title: 'Note archived' }); navigate('/notes'); } };
  const handleDelete = () => { if (note && confirm('Delete this note permanently?')) { deleteNote(note.id); toast({ title: 'Note deleted' }); navigate('/notes'); } };
  const handleLinkClick = (noteName: string) => {
    const linkedNote = activeNotes.find(n => n.title.toLowerCase() === noteName.toLowerCase());
    if (linkedNote) navigate(`/notes/${linkedNote.id}`);
    else toast({ title: `Note "${noteName}" not found` });
  };

  if (!note) return (<div className="min-h-screen p-8 flex items-center justify-center"><div className="text-center"><h2 className="text-xl font-medium">Note not found</h2><Button variant="outline" className="mt-4" onClick={() => navigate('/notes')}><ArrowLeft className="h-4 w-4 mr-2" />Back to Notes</Button></div></div>);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}><ArrowLeft className="h-4 w-4 mr-2" />Notes</Button>
          <div className="flex items-center gap-2">
            {hasChanges && <span className="text-xs text-muted-foreground flex items-center gap-1"><Save className="h-3 w-3 animate-pulse" />Saving...</span>}
            <Button variant="ghost" size="sm" onClick={() => setIsPreview(!isPreview)}>{isPreview ? 'Edit' : 'Preview'}</Button>
            <Button variant="ghost" size="icon" onClick={handlePin} className={cn(note.is_pinned && "text-primary")}><Pin className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={handleArchive}><Archive className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>
      <div className="flex-1 max-w-4xl mx-auto w-full p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
          <div className="space-y-4">
            <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Note title..." className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 bg-transparent" />
            {isPreview ? (<div className="prose prose-sm dark:prose-invert max-w-none min-h-[400px]"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*No content yet*'}</ReactMarkdown></div>) : (<Textarea value={content} onChange={(e) => handleContentChange(e.target.value)} placeholder="Start writing..." className="min-h-[400px] resize-none border-0 px-0 focus-visible:ring-0 bg-transparent text-base leading-relaxed" />)}

            {/* Daily Reflection for daily notes */}
            {note.is_daily_note && (
              <div className="mt-6">
                <DailyReflection
                  gratitude={reflectionGratitude}
                  accomplishment={reflectionAccomplishment}
                  improvement={reflectionImprovement}
                  onUpdate={handleReflectionUpdate}
                />
              </div>
            )}
          </div>
          <aside className="space-y-4">
            <Card><CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><Tag className="h-4 w-4" />Tags</CardTitle></CardHeader><CardContent className="pt-0"><div className="flex flex-wrap gap-1.5 mb-2">{(note.tags || []).map(tag => <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => handleRemoveTag(tag)}>#{tag} ×</Badge>)}</div><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Add tag..." className="h-8 text-sm" /></CardContent></Card>
            {linkedNoteNames.length > 0 && <Card><CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><Link2 className="h-4 w-4" />Links ({linkedNoteNames.length})</CardTitle></CardHeader><CardContent className="pt-0 space-y-1">{linkedNoteNames.map((name, i) => <button key={i} onClick={() => handleLinkClick(name)} className="block w-full text-left text-sm text-primary hover:underline truncate">{name}</button>)}</CardContent></Card>}
            {backlinks.length > 0 && <Card><CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Backlinks ({backlinks.length})</CardTitle></CardHeader><CardContent className="pt-0 space-y-1">{backlinks.map(linkedNote => <button key={linkedNote.id} onClick={() => navigate(`/notes/${linkedNote.id}`)} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground truncate">{linkedNote.title}</button>)}</CardContent></Card>}
            <Card><CardContent className="py-3 text-xs text-muted-foreground space-y-1"><div className="flex items-center gap-2"><Clock className="h-3 w-3" />Created: {format(new Date(note.created_at), 'MMM d, yyyy')}</div><div className="flex items-center gap-2"><Clock className="h-3 w-3" />Updated: {format(new Date(note.updated_at), 'MMM d, h:mm a')}</div></CardContent></Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
