import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AppSettings } from "@/types/note";

export function ThemeToggle() {
  const [settings, setSettings] = useLocalStorage<AppSettings>("app-settings", {
    theme: 'light',
    categories: ['Personal', 'Work', 'Ideas']
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme, mounted]);

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="hover:bg-accent/50"
    >
      {settings.theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}