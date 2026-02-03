import { format } from 'date-fns';
import { Calendar, Clock, AlertCircle, Star, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { QuickAdd } from '@/components/QuickAdd';
import { TaskCard } from '@/components/TaskCard';
import { HabitTracker } from '@/components/HabitTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TodayDashboard() {
  const navigate = useNavigate();
  const { todaysTasks, overdueTasks, priorityTasks, toggleTask, getOrCreateDailyNote, deleteTask, archiveTask } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFormatted = format(new Date(), 'EEEE, MMMM d');

  const handleOpenDailyNote = async () => {
    const dailyNote = await getOrCreateDailyNote(today);
    if (dailyNote) navigate(`/notes/${dailyNote.id}`);
  };

  const greeting = () => { const hour = new Date().getHours(); if (hour < 12) return 'Good morning'; if (hour < 17) return 'Good afternoon'; return 'Good evening'; };
  const totalTasks = todaysTasks.length + overdueTasks.length;

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-muted-foreground mb-1"><Calendar className="h-4 w-4" /><span className="text-sm">{todayFormatted}</span></div>
        <h1 className="text-3xl font-bold text-foreground">{greeting()} <Sparkles className="inline h-6 w-6 text-yellow-500" /></h1>
        <p className="text-muted-foreground mt-1">{totalTasks > 0 ? `You have ${totalTasks} task${totalTasks !== 1 ? 's' : ''} to focus on today.` : "You're all caught up!"}</p>
      </header>
      <section className="mb-8"><QuickAdd autoFocus className="max-w-2xl" /></section>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {overdueTasks.length > 0 && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2 text-red-500"><AlertCircle className="h-4 w-4" />Overdue ({overdueTasks.length})</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-1">{overdueTasks.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} onArchive={() => archiveTask(task.id)} compact />)}</CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Today's Tasks ({todaysTasks.length})</CardTitle><Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>View All <ArrowRight className="ml-1 h-3 w-3" /></Button></div></CardHeader>
            <CardContent className="pt-0">{todaysTasks.length === 0 ? <div className="text-center py-8 text-muted-foreground"><p className="text-sm">No tasks for today</p></div> : <div className="space-y-1">{todaysTasks.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} onArchive={() => archiveTask(task.id)} />)}</div>}</CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <HabitTracker compact />
          {priorityTasks.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-primary" />Top Priority</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-1">{priorityTasks.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} compact />)}</CardContent>
            </Card>
          )}
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={handleOpenDailyNote}>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" />Today's Note</CardTitle></CardHeader>
            <CardContent className="pt-0"><p className="text-sm text-muted-foreground">Click to open or create your daily note.</p><Button variant="outline" size="sm" className="mt-3 w-full">Open Daily Note</Button></CardContent>
          </Card>
          <Card className="bg-muted/30"><CardContent className="py-4"><p className="text-xs text-muted-foreground mb-2 font-medium">Keyboard Shortcuts</p><div className="space-y-1 text-xs text-muted-foreground"><div className="flex justify-between"><span>Command palette</span><Badge variant="outline" className="text-[10px] h-5">⌘K</Badge></div><div className="flex justify-between"><span>New task</span><Badge variant="outline" className="text-[10px] h-5">⌘N</Badge></div></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
