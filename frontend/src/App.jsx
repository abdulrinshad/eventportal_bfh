import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import ProtectedRoute from './routes/ProtectedRoute';

import EventDetails        from './pages/EventDetails';
import CreateEvent         from './pages/CreateEvent';
import EditEvent           from './pages/EditEvent';
import RegistrationSuccess from './pages/RegistrationSuccess';
import Dashboard           from './pages/Dashboard';
import Login               from './pages/Login';
import Profile             from './pages/Profile';
import Notifications       from './pages/Notifications';
import Settings            from './pages/Settings';

/**
 * SmartRoot — Redirects based on auth state.
 * Logged-in users → /dashboard  |  Guests → /events/1
 */
function SmartRoot() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return <Navigate to={user ? '/dashboard' : '/events/1'} replace />;
}

/**
 * Wrapper for RegistrationSuccess — proper useNavigate callbacks.
 */
function RegistrationSuccessWrapper() {
  const navigate = useNavigate();
  return (
    <RegistrationSuccess
      onBackToEvents={() => navigate('/events/1')}
      onViewRegistrations={() => navigate('/dashboard')}
    />
  );
}

/**
 * Wrapper for CreateEvent — proper useNavigate callbacks.
 */
function CreateEventWrapper() {
  const navigate = useNavigate();
  return (
    <CreateEvent
      onPublish={() => navigate('/dashboard')}
      onCancel={() => navigate(-1)}
      onNavigateToEdit={() => navigate('/edit/new')}
    />
  );
}

/**
 * Wrapper for EditEvent — proper useNavigate callbacks.
 */
function EditEventWrapper() {
  const navigate = useNavigate();
  return (
    <EditEvent
      onSave={() => navigate('/dashboard')}
      onDiscard={() => navigate(-1)}
      onNavigateToCreate={() => navigate('/create')}
    />
  );
}

/**
 * App — Root component with full React Router setup.
 *
 * Public routes:
 *   /                  → SmartRoot (auth-aware redirect)
 *   /events/:id        → EventDetails
 *   /login             → Login / Register page
 *   /register          → Redirects to /login
 *   /registration-success → RegistrationSuccess
 *
 * Protected routes (require login):
 *   /dashboard     → Dashboard (Sidebar + sub-views)
 *   /profile       → Profile page
 *   /notifications → Notifications page
 *   /settings      → Settings page
 *   /create        → CreateEvent
 *   /edit/:id      → EditEvent
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <Routes>
            {/* ── Smart Root ── */}
            <Route path="/" element={<SmartRoot />} />

            {/* ── Public Routes ── */}
            <Route path="/events/:id"           element={<EventDetails />} />
            <Route path="/login"                element={<Login />} />
            <Route path="/register"             element={<Navigate to="/login" replace />} />
            <Route path="/registration-success" element={<RegistrationSuccessWrapper />} />

            {/* ── Protected Routes ── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateEventWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <EditEventWrapper />
                </ProtectedRoute>
              }
            />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

