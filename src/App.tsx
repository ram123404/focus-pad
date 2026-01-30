import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AppProvider } from "./context/AppContext";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import { TodayDashboard } from "./pages/TodayDashboard";
import { NotesPage } from "./pages/NotesPage";
import { NoteEditorPage } from "./pages/NoteEditorPage";
import { TasksPage } from "./pages/TasksPage";
import { FocusPage } from "./pages/FocusPage";
import { ArchivePage } from "./pages/ArchivePage";
import { SettingsPage } from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<AuthRedirect />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppProvider>
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
                  </AppProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
