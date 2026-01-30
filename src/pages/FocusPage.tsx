import { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, CheckSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';
import { useEffect, useCallback } from 'react';

export function FocusPage() {
  const { settings, todaysTasks, priorityTasks, toggleTask } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState((settings?.pomodoro_work_minutes ?? 25) * 60);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const resetTimer = useCallback((newMode: 'work' | 'break' = 'work') => {
    setMode(newMode);
    const workMins = settings?.pomodoro_work_minutes ?? 25;
    const breakMins = settings?.pomodoro_break_minutes ?? 5;
    setTimeLeft(newMode === 'work' ? workMins * 60 : breakMins * 60);
    setIsRunning(false);
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      setIsRunning(false);
      // Switch modes
      if (mode === 'work') {
        resetTimer('break');
        // Could trigger notification here
      } else {
        resetTimer('work');
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, resetTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const workMins = settings?.pomodoro_work_minutes ?? 25;
  const breakMins = settings?.pomodoro_break_minutes ?? 5;
  const progress = mode === 'work' 
    ? ((workMins * 60 - timeLeft) / (workMins * 60)) * 100
    : ((breakMins * 60 - timeLeft) / (breakMins * 60)) * 100;

  const tasksToShow = priorityTasks.length > 0 ? priorityTasks : todaysTasks.slice(0, 3);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Focus Mode
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'work' ? 'Time to focus!' : 'Take a break'}
          </p>
        </header>

        {/* Timer */}
        <Card className={cn(
          "mb-8 transition-colors",
          mode === 'work' ? "border-primary/30 bg-primary/5" : "border-green-500/30 bg-green-500/5"
        )}>
          <CardContent className="py-12">
            {/* Progress ring */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  className={cn(
                    "transition-all duration-1000",
                    mode === 'work' ? "text-primary" : "text-green-500"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-mono font-bold">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-muted-foreground mt-2 uppercase tracking-wider">
                  {mode === 'work' ? 'Focus Time' : 'Break Time'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={() => resetTimer(mode)}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                size="lg"
                className={cn(
                  "h-14 w-32 text-lg",
                  mode === 'break' && "bg-green-500 hover:bg-green-600"
                )}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => resetTimer(mode === 'work' ? 'break' : 'work')}
              >
                {mode === 'work' ? 'Skip to Break' : 'Skip to Work'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task Selection */}
        {tasksToShow.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Focus on a task
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {tasksToShow.map(task => (
                <div
                  key={task.id}
                  className={cn(
                    "rounded-lg transition-colors cursor-pointer",
                    selectedTaskId === task.id && "bg-primary/10 ring-1 ring-primary"
                  )}
                  onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                >
                  <TaskCard
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                    compact
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Space</kbd> to start/pause timer
        </p>
      </div>
    </div>
  );
}
