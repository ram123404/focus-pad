import { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Download, Upload, Trash2, Bell } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { getNotificationSettings, saveNotificationSettings, useNotifications } from '@/hooks/useNotifications';

export function SettingsPage() {
  const { settings, updateSettings, notes, tasks, tags } = useApp();
  const [notificationSettings, setNotificationSettings] = useState(getNotificationSettings);
  const { requestPermission, isSupported, permission } = useNotifications([], notificationSettings);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) { const granted = await requestPermission(); if (!granted) { toast({ title: 'Notifications blocked', variant: 'destructive' }); return; } }
    const newSettings = { ...notificationSettings, enabled };
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
    toast({ title: enabled ? 'Notifications enabled' : 'Notifications disabled' });
  };

  const handleReminderTimeChange = (minutes: number) => {
    const newSettings = { ...notificationSettings, reminderMinutes: minutes };
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleExport = () => {
    const data = { notes, tasks, tags, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `focuspad-backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data exported successfully' });
  };

  const handleClearData = () => { if (confirm('Delete all data?')) { localStorage.clear(); window.location.reload(); } };

  if (!settings) return <div className="min-h-screen p-6 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-2xl mx-auto">
      <header className="mb-8"><h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" />Settings</h1></header>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle><CardDescription>Get reminded about upcoming tasks</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            {!isSupported ? <p className="text-sm text-muted-foreground">Your browser doesn't support notifications.</p> : (
              <>
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Enable Reminders</Label><p className="text-xs text-muted-foreground">{permission === 'denied' ? 'Notifications blocked in browser' : 'Receive browser notifications'}</p></div><Switch checked={notificationSettings.enabled} onCheckedChange={handleNotificationToggle} disabled={permission === 'denied'} /></div>
                {notificationSettings.enabled && <div className="space-y-2"><Label>Remind me: {notificationSettings.reminderMinutes} minutes before</Label><Slider value={[notificationSettings.reminderMinutes]} onValueChange={([value]) => handleReminderTimeChange(value)} min={5} max={60} step={5} /></div>}
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2"><Label>Theme</Label><Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'system') => { updateSettings({ theme: value }); document.documentElement.classList.toggle('dark', value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)); }}><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light"><span className="flex items-center gap-2"><Sun className="h-4 w-4" /> Light</span></SelectItem><SelectItem value="dark"><span className="flex items-center gap-2"><Moon className="h-4 w-4" /> Dark</span></SelectItem><SelectItem value="system"><span className="flex items-center gap-2"><Monitor className="h-4 w-4" /> System</span></SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Font Size</Label><Select value={settings.font_size} onValueChange={(value: 'small' | 'medium' | 'large') => updateSettings({ font_size: value })}><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Focus Timer</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2"><Label>Work Duration: {settings.pomodoro_work_minutes} minutes</Label><Slider value={[settings.pomodoro_work_minutes]} onValueChange={([value]) => updateSettings({ pomodoro_work_minutes: value })} min={5} max={60} step={5} /></div>
            <div className="space-y-2"><Label>Break Duration: {settings.pomodoro_break_minutes} minutes</Label><Slider value={[settings.pomodoro_break_minutes]} onValueChange={([value]) => updateSettings({ pomodoro_break_minutes: value })} min={1} max={30} step={1} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Data Management</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3"><Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export Data</Button></div>
            <div className="pt-4 border-t"><Button variant="destructive" onClick={handleClearData}><Trash2 className="h-4 w-4 mr-2" />Clear All Data</Button><p className="text-xs text-muted-foreground mt-2">This will permanently delete all local data.</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
