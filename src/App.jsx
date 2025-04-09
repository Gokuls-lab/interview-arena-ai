
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import CreateJob from "./pages/CreateJob";
import Interview from "./pages/Interview";
import MockInterview from "./pages/MockInterview";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute>
                <JobList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:id" 
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-job" 
            element={
              <ProtectedRoute roleRequired="recruiter">
                <CreateJob />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview/:id" 
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mock-interview" 
            element={
              <ProtectedRoute roleRequired="jobseeker">
                <MockInterview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/applications" 
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
