import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AnimatePresence } from 'framer-motion';

import HomePage from './pages/Home/HomePage.jsx';
import PropertiesPage from './pages/Properties/PropertiesPage.jsx';
import PropertyDetailPage from './pages/PropertyDetail/PropertyDetailPage.jsx';
import AboutPage from './pages/About/AboutPage.jsx';
import WhyVadodaraPage from './pages/WhyVadodara/WhyVadodaraPage.jsx';
import ContactPage from './pages/Contact/ContactPage.jsx';
import TermsPage from './pages/Terms/TermsPage.jsx';
import PolicyPage from './pages/Policy/PolicyPage.jsx';
import AdminLoginPage from './pages/Admin/AdminLoginPage.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminPropertyForm from './pages/Admin/AdminPropertyForm.jsx';
import AdminResetPasswordPage from './pages/Admin/AdminResetPasswordPage.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
import SignupPage from './pages/Auth/SignupPage.jsx';
import AccountPage from './pages/Auth/AccountPage.jsx';
import UserDashboardPage from './pages/Auth/UserDashboardPage.jsx';
import PostPropertyPage from './pages/Auth/PostPropertyPage.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/why-vadodara" element={<WhyVadodaraPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/policy" element={<PolicyPage />} />

        {/* User auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
        <Route path="/post-property" element={<ProtectedRoute><PostPropertyPage /></ProtectedRoute>} />
        <Route path="/dashboard/properties/:id" element={<ProtectedRoute><PostPropertyPage /></ProtectedRoute>} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute redirectTo="/admin/login" requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="properties/new" element={<AdminPropertyForm />} />
          <Route path="properties/:id/edit" element={<AdminPropertyForm />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
