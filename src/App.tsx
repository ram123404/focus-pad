import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AppLayout } from "./components/layout/AppLayout";
import { TodayDashboard } from "./pages/TodayDashboard";
import { NotesPage } from "./pages/NotesPage";
import { NoteEditorPage } from "./pages/NoteEditorPage";
import { TasksPage } from "./pages/TasksPage";
import { FocusPage } from "./pages/FocusPage";
import { ArchivePage } from "./pages/ArchivePage";
import { SettingsPage } from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppLayout>
            <Routes>
              <Route path="/" element={<TodayDashboard />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/notes/:id" element={<NoteEditorPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/focus" element={<FocusPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
