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
import Register            from './pages/Register';
import ForgotPassword      from './pages/ForgotPassword';
import OTPVerification     from './pages/OTPVerification';
import ResetPassword       from './pages/ResetPassword';
import Profile             from './pages/Profile';
import Notifications       from './pages/Notifications';
import Settings            from './pages/Settings';
import About               from './pages/About';
import Contact             from './pages/Contact';
import HelpCenter          from './pages/HelpCenter';
import MyCreatedEvents     from './pages/MyCreatedEvents';
import MyRegisteredEvents  from './pages/MyRegisteredEvents';
import Home                from './pages/Home';
import ExploreEvents       from './pages/ExploreEvents';

/**
 * SmartRoot — Redirects based on auth state.
 * Logged-in users → /dashboard  |  Guests → /events/1
 */
function SmartRoot() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return <Home />;
}

/**
 * Wrapper for RegistrationSuccess — proper useNavigate callbacks.
 */
function RegistrationSuccessWrapper() {
  const navigate = useNavigate();
  return (
    <RegistrationSuccess
      onBackToEvents={() => navigate('/events/1')}
      onViewRegistrations={() => navigate('/my-registrations')}
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
      onPublish={() => navigate('/my-created-events')}
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
      onSave={() => navigate('/my-created-events')}
      onDiscard={() => navigate(-1)}
      onNavigateToCreate={() => navigate('/create')}
    />
  );
}

/**
 * Wrapper for MyCreatedEvents — proper useNavigate callbacks.
 */
function MyCreatedEventsWrapper() {
  const navigate = useNavigate();
  return (
    <MyCreatedEvents
      onViewParticipants={() => navigate('/dashboard')}
      onViewEvent={(event) => navigate(`/events/${event.id}`)}
      onEditEvent={(event) => navigate(`/edit/${event.id}`)}
      onCreateEvent={() => navigate('/create')}
    />
  );
}

/**
 * Wrapper for MyRegisteredEvents — proper useNavigate callbacks.
 */
function MyRegisteredEventsWrapper() {
  const navigate = useNavigate();
  return (
    <MyRegisteredEvents
      onViewHistory={() => navigate('/dashboard')}
      onViewDetails={(id) => navigate(`/events/${id}`)}
    />
  );
}

/**
 * App — Root component with full React Router setup.
 *
 * Public routes:
 *   /                  → SmartRoot (auth-aware redirect)
 *   /events/:id        → EventDetails
 *   /login             → Login page
 *   /register          → Register page
 *   /forgot-password   → Forgot Password page
 *   /otp-verification  → OTP Verification page
 *   /reset-password    → Reset Password page
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
            <Route path="/events"               element={<ExploreEvents />} />
            <Route path="/events/:id"           element={<EventDetails />} />
            <Route path="/login"                element={<Login />} />
            <Route path="/register"             element={<Register />} />
            <Route path="/forgot-password"      element={<ForgotPassword />} />
            <Route path="/otp-verification"     element={<OTPVerification />} />
            <Route path="/reset-password"       element={<ResetPassword />} />
            <Route path="/registration-success" element={<RegistrationSuccessWrapper />} />
            <Route path="/about"                element={<About />} />
            <Route path="/contact"              element={<Contact />} />
            <Route path="/help-center"          element={<HelpCenter />} />

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
            <Route
              path="/my-registrations"
              element={
                <ProtectedRoute>
                  <MyRegisteredEventsWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-created-events"
              element={
                <ProtectedRoute>
                  <MyCreatedEventsWrapper />
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

