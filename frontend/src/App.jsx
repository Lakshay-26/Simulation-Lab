import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

import { Dashboard } from './pages/Dashboard';
import { RedTeam } from './pages/RedTeam';
import { BlueTeam } from './pages/BlueTeam';
import { SecurityHeaders } from './pages/SecurityHeaders';
import { Reports } from './pages/Reports';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      <div className="flex flex-col md:pl-64 min-h-screen">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/red-team"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <RedTeam />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/blue-team"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <BlueTeam />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/security-tool"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SecurityHeaders />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Reports />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <History />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};
export default App;
