
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Forums from "./pages/Forums";
import Projects from "./pages/Projects";
import Competitions from "./pages/Competitions";
import Mentorship from "./pages/Mentorship";
import Achievements from "./pages/Achievements";
import Learning from "./pages/Learning";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import CodeSolutionView from "./pages/CodeSolutionView";
import ContestDiscussion from "./pages/ContestDiscussion";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/forums" element={<ProtectedRoute><Forums /></ProtectedRoute>} />
                <Route path="/forums/:forumId" element={<ProtectedRoute><Forums /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/competitions" element={<ProtectedRoute><Competitions /></ProtectedRoute>} />
                <Route path="/contests/:contestId/discussions" element={<ProtectedRoute><ContestDiscussion /></ProtectedRoute>} />
                <Route path="/contests/discussions" element={<ProtectedRoute><ContestDiscussion /></ProtectedRoute>} />
                <Route path="/solutions/:contestId/:solutionId" element={<ProtectedRoute><CodeSolutionView /></ProtectedRoute>} />
                <Route path="/mentorship" element={<ProtectedRoute><Mentorship /></ProtectedRoute>} />
                <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
