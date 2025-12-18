import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  CheckSquare, 
  Archive, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const navItems = [
  { path: '/', label: 'Today', icon: Calendar },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/focus', label: 'Focus', icon: Zap },
  { path: '/archive', label: 'Archive', icon: Archive },
];

export function Sidebar() {
  const location = useLocation();
  const { settings, updateSettings, todaysTasks, overdueTasks } = useApp();
  const [collapsed, setCollapsed] = useState(settings.sidebarCollapsed);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    updateSettings({ sidebarCollapsed: !collapsed });
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const taskCount = todaysTasks.length + overdueTasks.length;

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "h-14 flex items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <h1 className="font-bold text-lg text-sidebar-foreground tracking-tight">
            Focus<span className="text-primary">Pad</span>
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || 
            (path !== '/' && location.pathname.startsWith(path));
          const showBadge = path === '/' && taskCount > 0;

          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent text-sidebar-foreground",
                isActive && "bg-sidebar-accent text-sidebar-primary font-medium",
                collapsed && "justify-center"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {taskCount > 9 ? '9+' : taskCount}
                  </span>
                )}
              </div>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-sidebar-border p-2 space-y-1",
        collapsed && "flex flex-col items-center"
      )}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "w-10 h-10 p-0 justify-center"
          )}
          onClick={toggleTheme}
        >
          {settings.theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          {!collapsed && <span>{settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </Button>

        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
            "hover:bg-sidebar-accent text-sidebar-foreground",
            location.pathname === '/settings' && "bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
