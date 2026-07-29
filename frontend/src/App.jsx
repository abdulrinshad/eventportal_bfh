import React, { useContext } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import ExploreEventsPublic from './pages/ExploreEvents';
import EventDetailsPublic from './pages/EventDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import HelpCenterPublic from './pages/HelpCenter';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OTPVerification from './pages/OTPVerification';
import ResetPassword from './pages/ResetPassword';
import RegistrationSuccess from './pages/RegistrationSuccess';
import RegisterOTP from './pages/RegisterOTP';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentSettings from './pages/student/StudentSettings';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentHelpCenter from './pages/student/StudentHelpCenter';
import ExploreEventsStudent from './pages/student/ExploreEvents';
import MyRegisteredEventsStudent from './pages/student/MyRegisteredEvents';
import OrganizerApplication from './pages/student/OrganizerApplication';
import OrganizerApplicationSuccess from './pages/student/OrganizerApplicationSuccess';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerProfile from './pages/organizer/OrganizerProfile';
import OrganizerNotifications from './pages/organizer/OrganizerNotifications';
import OrganizerHelpCenter from './pages/organizer/OrganizerHelpCenter';
import CreateEventOrganizer from './pages/organizer/CreateEvent';
import EditEventOrganizer from './pages/organizer/EditEvent';
import MyCreatedEventsOrganizer from './pages/organizer/MyCreatedEvents';
import EventDetailsOrganizer from './pages/organizer/EventDetails';
import ParticipantsOrganizer from './pages/organizer/Participants';
import EventAnalyticsOrganizer from './pages/organizer/EventAnalytics';
import PendingEventsOrganizer from './pages/organizer/PendingEvents';
import RejectedEventsOrganizer from './pages/organizer/RejectedEvents';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Legacy Redirection Component
function LegacyRedirect() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'ORGANIZER') return <Navigate to="/organizer/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

function RegistrationSuccessWrapper() {
  const navigate = useNavigate();
  return (
    <RegistrationSuccess
      onBackToEvents={() => navigate('/events')}
      onViewRegistrations={() => navigate('/student/registrations')}
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
            <Route path="/events" element={<ExploreEventsPublic />} />
            <Route path="/events/:id" element={<EventDetailsPublic />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help-center" element={<HelpCenterPublic />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register/verify-otp" element={<RegisterOTP />} />
            <Route path="/registration-success" element={<RegistrationSuccessWrapper />} />

            {/* ---------- Student Routes ---------- */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/events"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <ExploreEventsStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/registrations"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <MyRegisteredEventsStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/help-center"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentHelpCenter />
                </ProtectedRoute>
              }
            />
             <Route
              path="/organizer/apply"
              element={<OrganizerApplication />}
            />
            <Route
              path="/organizer/application-success"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <OrganizerApplicationSuccess />
                </ProtectedRoute>
              }
            />

            {/* ---------- Organizer Routes ---------- */}
            <Route
              path="/organizer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/profile"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <MyCreatedEventsOrganizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/create"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <CreateEventOrganizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <EditEventOrganizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/pending"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <PendingEventsOrganizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/rejected"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <RejectedEventsOrganizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/participants"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <ParticipantsOrganizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/analytics"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <EventAnalyticsOrganizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/notifications"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/help-center"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerHelpCenter />
                </ProtectedRoute>
              }
            />

            {/* ---------- Admin Routes ---------- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* ---------- Legacy Redirection Fallbacks ---------- */}
            <Route path="/dashboard" element={<LegacyRedirect />} />
            <Route path="/profile" element={<LegacyRedirect />} />
            <Route path="/notifications" element={<LegacyRedirect />} />
            <Route path="/settings" element={<LegacyRedirect />} />
            <Route path="/create" element={<LegacyRedirect />} />
            <Route path="/my-created-events" element={<LegacyRedirect />} />
            <Route path="/my-registrations" element={<LegacyRedirect />} />

            {/* ---------- Fallback ---------- */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;