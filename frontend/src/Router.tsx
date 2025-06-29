import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Login, Wallpapers, AuthGoogleCallback } from './pages';
import Categories from './pages/Categories/Categories';
import Profile from './pages/Profile/Profile';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import Favorites from './pages/Favorites/Favorites';
import NotFound from './pages/NotFound/NotFound';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRouter = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/google/callback" element={<AuthGoogleCallback />} />
      {/* Public routes - no authentication required */}
      <Route path="/" element={<Wallpapers />} />
      <Route path="/wallpapers" element={<Wallpapers />} />
      <Route path="/categories" element={<Categories />} />
      {/* Protected routes - authentication required */}
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-panel"
        element={
          <ProtectedRoute>
            <AdminPanel />
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
      {/* 404 Not Found route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRouter; 