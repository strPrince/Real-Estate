import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AnimatePresence, motion } from 'framer-motion';

import LoadingScreen from './components/LoadingScreen/LoadingScreen.jsx';
import HomePage from './pages/Home/HomePage.jsx';
import PropertiesPage from './pages/Properties/PropertiesPage.jsx';
import PropertyDetailPage from './pages/PropertyDetail/PropertyDetailPage.jsx';
import ComparePage from './pages/Properties/ComparePage.jsx';
import AboutPage from './pages/About/AboutPage.jsx';
import WhyVadodaraPage from './pages/WhyVadodara/WhyVadodaraPage.jsx';
import ContactPage from './pages/Contact/ContactPage.jsx';
import LegalPage from './pages/Legal/LegalPage.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminPropertyForm from './pages/Admin/AdminPropertyForm.jsx';
import AdminUsersPage from './pages/Admin/AdminUsersPage.jsx';
import AdminUserDetailPage from './pages/Admin/AdminUserDetailPage.jsx';
import AdminLocalitiesPage from './pages/Admin/AdminLocalitiesPage.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
import SignupPage from './pages/Auth/SignupPage.jsx';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage.jsx';
import VerifyOTPPage from './pages/Auth/VerifyOTPPage.jsx';
import AccountPage from './pages/Auth/AccountPage.jsx';
import UserDashboardPage from './pages/Auth/UserDashboardPage.jsx';
import PostPropertyPage from './pages/Auth/PostPropertyPage.jsx';
import QueriesPage from './pages/Queries/QueriesPage.jsx';
import HelpPage from './pages/Help/HelpPage.jsx';

import CompareBar from './components/CompareBar/CompareBar.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/about" element={<AboutPage />} />
        <Route path="/why-vadodara" element={<WhyVadodaraPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<LegalPage />} />
        <Route path="/policy" element={<LegalPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* User auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyOTPPage />} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
        <Route path="/my-queries" element={<ProtectedRoute><QueriesPage /></ProtectedRoute>} />
        <Route path="/post-property" element={<ProtectedRoute><PostPropertyPage /></ProtectedRoute>} />
        <Route path="/dashboard/properties/:id" element={<ProtectedRoute><PostPropertyPage /></ProtectedRoute>} />


        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute redirectTo="/login" requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
          <Route path="properties/new" element={<AdminPropertyForm />} />
          <Route path="properties/:id/edit" element={<AdminPropertyForm />} />
          <Route path="localities" element={<AdminLocalitiesPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
    <CompareBar />
    </>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load for animation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <CompareProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <AnimatePresence>
            {loading ? (
              <LoadingScreen key="loader" />
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
              >
                <AnimatedRoutes />
              </motion.div>
            )}
          </AnimatePresence>
        </BrowserRouter>
      </CompareProvider>
    </AuthProvider>
  );
}
