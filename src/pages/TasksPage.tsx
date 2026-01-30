import { useState, useMemo } from 'react';
import { Search, Calendar, Clock, AlertCircle, CheckCircle2, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/TaskCard';
import { QuickAdd } from '@/components/QuickAdd';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TasksPage() {
  const { tasks, todaysTasks, overdueTasks, upcomingTasks, completedTasks, toggleTask, deleteTask, archiveTask } = useApp();
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('today');

  const filterTasks = (taskList: typeof tasks) => {
    return taskList.filter(task => {
      if (task.is_archived) return false;
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      return true;
    });
  };

  const filteredToday = useMemo(() => filterTasks(todaysTasks), [todaysTasks, search, filterPriority]);
  const filteredOverdue = useMemo(() => filterTasks(overdueTasks), [overdueTasks, search, filterPriority]);
  const filteredUpcoming = useMemo(() => filterTasks(upcomingTasks), [upcomingTasks, search, filterPriority]);
  const filteredCompleted = useMemo(() => filterTasks(completedTasks), [completedTasks, search, filterPriority]);
  const allActiveTasks = useMemo(() => filterTasks(tasks.filter(t => !t.is_archived && t.status === 'todo')), [tasks, search, filterPriority]);

  const renderTaskList = (taskList: typeof tasks, emptyMessage: string) => {
    if (taskList.length === 0) return (<div className="text-center py-12 text-muted-foreground"><CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-20" /><p>{emptyMessage}</p></div>);
    return (<div className="space-y-1">{taskList.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} onArchive={() => archiveTask(task.id)} />)}</div>);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-4xl mx-auto">
      <header className="mb-6"><h1 className="text-2xl font-bold">Tasks</h1><p className="text-sm text-muted-foreground mt-1">{allActiveTasks.length} active task{allActiveTasks.length !== 1 ? 's' : ''}</p></header>
      <div className="mb-6"><QuickAdd defaultType="task" /></div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="pl-9" /></div>
        <Select value={filterPriority} onValueChange={setFilterPriority}><SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="all">All Priorities</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="today" className="gap-2"><Clock className="h-4 w-4" />Today{filteredToday.length > 0 && <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">{filteredToday.length}</span>}</TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2"><AlertCircle className="h-4 w-4" />Overdue{filteredOverdue.length > 0 && <span className="ml-1 text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full">{filteredOverdue.length}</span>}</TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2"><Calendar className="h-4 w-4" />Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="gap-2"><CheckCircle2 className="h-4 w-4" />Done</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-0">{renderTaskList(filteredToday, "No tasks for today. Use quick add above!")}</TabsContent>
        <TabsContent value="overdue" className="mt-0">{renderTaskList(filteredOverdue, "No overdue tasks. Great job!")}</TabsContent>
        <TabsContent value="upcoming" className="mt-0">{renderTaskList(filteredUpcoming, "No upcoming tasks scheduled.")}</TabsContent>
        <TabsContent value="completed" className="mt-0">{renderTaskList(filteredCompleted, "No completed tasks yet.")}</TabsContent>
      </Tabs>
    </div>
  );
}
