import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Calendar, Pin, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function NotesPage() {
  const navigate = useNavigate();
  const { activeNotes, createNote, tags } = useApp();
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotes = useMemo(() => {
    return activeNotes.filter(note => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(searchLower);
        const matchesContent = note.content.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesContent) return false;
      }
      if (filterTag !== 'all' && !note.tags.includes(filterTag)) return false;
      if (filterType === 'daily' && !note.is_daily_note) return false;
      if (filterType === 'regular' && note.is_daily_note) return false;
      if (filterType === 'pinned' && !note.is_pinned) return false;
      return true;
    }).sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [activeNotes, search, filterTag, filterType]);

  const handleCreateNote = async () => {
    const newNote = await createNote({
      title: 'Untitled',
      content: '',
      tags: [],
      is_pinned: false,
      is_archived: false,
      is_daily_note: false,
      daily_note_date: null,
      linked_notes: [],
    });
    if (newNote) navigate(`/notes/${newNote.id}`);
  };

  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    activeNotes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [activeNotes]);

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notes</h1>
            <p className="text-sm text-muted-foreground mt-1">{filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={handleCreateNote}><Plus className="h-4 w-4 mr-2" />New Note</Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notes</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="daily">Daily Notes</SelectItem>
            <SelectItem value="pinned">Pinned</SelectItem>
          </SelectContent>
        </Select>
        {uniqueTags.length > 0 && (
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {uniqueTags.map(tag => (<SelectItem key={tag} value={tag}>#{tag}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-medium text-lg">No notes found</h3>
          <p className="text-sm text-muted-foreground mt-1">{search ? 'Try a different search term' : 'Create your first note to get started'}</p>
          {!search && (<Button onClick={handleCreateNote} className="mt-4"><Plus className="h-4 w-4 mr-2" />Create Note</Button>)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map(note => (
            <Card key={note.id} className={cn("cursor-pointer hover:border-primary/50 transition-all hover:shadow-md", note.is_pinned && "border-primary/30 bg-primary/5")} onClick={() => navigate(`/notes/${note.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium line-clamp-1 flex-1">{note.title || 'Untitled'}</h3>
                  {note.is_pinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                </div>
                {note.content && <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{note.content.slice(0, 150)}</p>}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    {note.is_daily_note && <Badge variant="secondary" className="text-xs gap-1"><Calendar className="h-3 w-3" />Daily</Badge>}
                    {note.tags.slice(0, 2).map(tag => <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>)}
                    {note.tags.length > 2 && <Badge variant="outline" className="text-xs">+{note.tags.length - 2}</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(note.updated_at), 'MMM d')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
