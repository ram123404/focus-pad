import { ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '@/context/AppContext';
import { CommandPalette } from '@/components/CommandPalette';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { settings } = useApp();

  // Apply theme on mount and changes
  useEffect(() => {
    const isDark = settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [settings.theme]);

  // Apply font size
  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings.fontSize]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
