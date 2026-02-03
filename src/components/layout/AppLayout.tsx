import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '@/context/AppContext';
import { CommandPalette } from '@/components/CommandPalette';
import { ReflectionPopup } from '@/components/ReflectionPopup';
import { format } from 'date-fns';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { settings, getOrCreateDailyNote, updateNote, notes } = useApp();
  const [showReflectionPopup, setShowReflectionPopup] = useState(false);
  const [dailyNoteData, setDailyNoteData] = useState<{
    id: string;
    gratitude: string;
    accomplishment: string;
    improvement: string;
  } | null>(null);

  // Apply theme on mount and changes
  useEffect(() => {
    if (!settings) return;
    const isDark = settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [settings?.theme]);

  // Apply font size
  useEffect(() => {
    if (!settings) return;
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[settings.font_size];
  }, [settings?.font_size]);

  // Check if we should show end-of-day reflection popup (after 6 PM)
  useEffect(() => {
    const checkReflectionTime = () => {
      const hour = new Date().getHours();
      const today = new Date().toDateString();
      const lastShown = localStorage.getItem('lastReflectionShown');
      const lastSkipped = localStorage.getItem('lastReflectionSkip');

      // Show popup after 6 PM if not shown or skipped today
      if (hour >= 18 && lastShown !== today && lastSkipped !== today) {
        // Load today's daily note data
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const dailyNote = notes.find(n => n.is_daily_note && n.daily_note_date === todayStr);
        
        if (dailyNote) {
          setDailyNoteData({
            id: dailyNote.id,
            gratitude: (dailyNote as any).reflection_gratitude || '',
            accomplishment: (dailyNote as any).reflection_accomplishment || '',
            improvement: (dailyNote as any).reflection_improvement || '',
          });
        }
        
        setShowReflectionPopup(true);
        localStorage.setItem('lastReflectionShown', today);
      }
    };

    // Check on mount and every 30 minutes
    checkReflectionTime();
    const interval = setInterval(checkReflectionTime, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [notes]);

  const handleSaveReflection = async (gratitude: string, accomplishment: string, improvement: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let dailyNote = notes.find(n => n.is_daily_note && n.daily_note_date === todayStr);
    
    if (!dailyNote) {
      dailyNote = await getOrCreateDailyNote(todayStr);
    }
    
    if (dailyNote) {
      await updateNote(dailyNote.id, {
        reflection_gratitude: gratitude,
        reflection_accomplishment: accomplishment,
        reflection_improvement: improvement,
      } as any);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <CommandPalette />
      <ReflectionPopup
        open={showReflectionPopup}
        onOpenChange={setShowReflectionPopup}
        gratitude={dailyNoteData?.gratitude || ''}
        accomplishment={dailyNoteData?.accomplishment || ''}
        improvement={dailyNoteData?.improvement || ''}
        onSave={handleSaveReflection}
      />
    </div>
  );
}
