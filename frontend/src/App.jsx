import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import ExploreEvents from './pages/ExploreEvents';
import EventDetails from './pages/EventDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import HelpCenter from './pages/HelpCenter';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OTPVerification from './pages/OTPVerification';
import ResetPassword from './pages/ResetPassword';
import RegistrationSuccess from './pages/RegistrationSuccess';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';

import MyCreatedEvents from './pages/MyCreatedEvents';
import MyRegisteredEvents from './pages/MyRegisteredEvents';

function RegistrationSuccessWrapper() {
  const navigate = useNavigate();

  return (
    <RegistrationSuccess
      onBackToEvents={() => navigate('/events')}
      onViewRegistrations={() => navigate('/my-registrations')}
    />
  );
}

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

function MyRegisteredEventsWrapper() {
  const navigate = useNavigate();

  return (
    <MyRegisteredEvents
      onViewHistory={() => navigate('/dashboard')}
      onViewDetails={(id) => navigate(`/events/${id}`)}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <Routes>

            {/* ---------- Public Routes ---------- */}

            <Route path="/" element={<Home />} />
            <Route path="/events" element={<ExploreEvents />} />
            <Route path="/events/:id" element={<EventDetails />} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help-center" element={<HelpCenter />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/registration-success"
              element={<RegistrationSuccessWrapper />}
            />

            {/* ---------- Protected Routes ---------- */}

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
              path="/my-created-events"
              element={
                <ProtectedRoute>
                  <MyCreatedEventsWrapper />
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

            {/* ---------- Fallback ---------- */}

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;