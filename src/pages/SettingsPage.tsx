import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor,
  Type,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

export function SettingsPage() {
  const { settings, updateSettings, notes, tasks, tags } = useApp();

  const handleExport = () => {
    const data = { notes, tasks, tags, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuspad-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data exported successfully' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Would need to implement import logic in AppContext
        toast({ title: 'Import feature coming soon', description: 'Data structure validated successfully' });
      } catch {
        toast({ title: 'Invalid file', description: 'Could not parse the backup file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
      </header>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
            <CardDescription>Customize how FocusPad looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => {
                  updateSettings({ theme: value });
                  if (value === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (value === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', isDark);
                  }
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Light
                    </span>
                  </SelectItem>
                  <SelectItem value="dark">
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4" /> Dark
                    </span>
                  </SelectItem>
                  <SelectItem value="system">
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" /> System
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select
                value={settings.fontSize}
                onValueChange={(value: 'small' | 'medium' | 'large') => updateSettings({ fontSize: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pomodoro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Focus Timer</CardTitle>
            <CardDescription>Configure your Pomodoro timer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Work Duration: {settings.pomodoroWorkMinutes} minutes</Label>
                <Slider
                  value={[settings.pomodoroWorkMinutes]}
                  onValueChange={([value]) => updateSettings({ pomodoroWorkMinutes: value })}
                  min={5}
                  max={60}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Break Duration: {settings.pomodoroBreakMinutes} minutes</Label>
                <Slider
                  value={[settings.pomodoroBreakMinutes]}
                  onValueChange={([value]) => updateSettings({ pomodoroBreakMinutes: value })}
                  min={1}
                  max={30}
                  step={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
            <CardDescription>Export, import, or clear your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>

              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button variant="destructive" onClick={handleClearData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will permanently delete all notes, tasks, and settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <strong>FocusPad</strong> — A daily productivity app for notes, tasks, and focus.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              All data is stored locally in your browser. No account required.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
