import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PlaceholderPage from './components/PlaceholderPage';
import LoadingScreen from './components/LoadingScreen';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobDetailsPage from './pages/JobDetailsPage';
import JobList from './pages/JobList';
import SearchResultsPage from './pages/SearchResultsPage';
import CompaniesList from './pages/CompaniesList';
import CreateJobPage from './pages/CreateJobPage';
import MyJobsPage from './pages/MyJobsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import PrivacyPage from './pages/PrivacyPage';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route component (only for authenticated admin users)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // If not authenticated or not admin, redirect to admin login
  if (!isAuthenticated || user?.user_type !== 'admin') {
    return <Navigate to="/adminlogin" replace />;
  }
  
  return children;
};

// Public Route component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return children;
  }
  
  // If user is authenticated, redirect based on user type
  if (user?.user_type === 'admin') {
    return <Navigate to="/admin" />;
  }
  
  if (user?.user_type === 'recruiter') {
    return <Navigate to="/my-jobs" />;
  }
  
  // For candidates, redirect to jobs list
  return <Navigate to="/jobs" />;
};

// Home Route component (show different home based on user type)
const HomeRoute = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <HomePage />;
  }
  
  // If admin is authenticated, redirect to admin dashboard
  if (user?.user_type === 'admin') {
    return <Navigate to="/admin" />;
  }
  
  // If recruiter is authenticated, redirect to their jobs page
  if (user?.user_type === 'recruiter') {
    return <Navigate to="/my-jobs" />;
  }
  
  // For candidates, redirect directly to jobs list
  return <Navigate to="/jobs" />;
};

// App Content component that uses auth context
const AppContent = () => {
  const { loading, user, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }
  
  const isAdmin = user?.user_type === 'admin';
  const isAdminLoginPage = window.location.pathname === '/adminlogin';
  const isAdminPage = window.location.pathname === '/admin';
  
  // Special layout for admin login page OR when non-admin tries to access /admin
  if (isAdminLoginPage || (isAdminPage && (!isAuthenticated || user?.user_type !== 'admin'))) {
    return <AdminLogin />;
  }
  
  return (
    <div className="app">
      <Header />
      <main className="main-content"><Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
            {/* Admin Login Route */}
          <Route path="/adminlogin" element={<AdminLogin />} />
          
          {/* Admin Dashboard - Protected */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          {/* My Jobs page for recruiters */}
          <Route path="/my-jobs" element={
            <ProtectedRoute>
              <MyJobsPage />
            </ProtectedRoute>
          } />
            {/* Placeholder routes for future features */}
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <JobList />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute>
              <JobDetailsPage />
            </ProtectedRoute>
          } /><Route path="/create-job" element={
            <ProtectedRoute>
              <CreateJobPage />
            </ProtectedRoute>
          } />          <Route path="/companies" element={
            <ProtectedRoute>
              <CompaniesList />
            </ProtectedRoute>
          } />
          
          {/* Privacy Policy - Public route */}
          <Route path="/privacy" element={<PrivacyPage />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <PlaceholderPage messageKey="pages.profileComingSoon" />
            </ProtectedRoute>
          } />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {/* Hide footer for admin users */}
      {!isAdmin && <Footer />}
    </div>
  );
};

function App() {
  return <AppContent />;
}

export default App;
