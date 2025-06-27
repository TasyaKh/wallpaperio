import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Suspense } from 'react';
import { Login, Wallpapers, AuthGoogleCallback } from './pages';
import { Navbar } from './components/Navbar/Navbar';
import Categories from './pages/Categories/Categories';
import Profile from './pages/Profile/Profile';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Favorites from './pages/Favorites/Favorites';

// Protected Route component
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

// ToastContainer with theme
const ThemedToastContainer = () => {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme.mode}
    />
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/google/callback" element={<AuthGoogleCallback />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                      <Wallpapers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallpapers"
                element={
                  <ProtectedRoute>
                    <Wallpapers />
                  </ProtectedRoute>
                }
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/categories" element={<Categories />} />
              <Route
                path="/admin-panel"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
          <ThemedToastContainer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
