import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import ClaimsManagement from './components/ClaimsManagement';
import CreateClaim from './components/CreateClaim';
import PolicyManagement from './components/PolicyManagement';
import Navigation from './components/Navigation';
import AuthPage from './components/AuthPage';
import { authAPI } from './services/api';

const ProtectedRoute = ({ isAuthenticated, children }) =>
  isAuthenticated ? children : <Navigate to="/" replace />;

function App() {
  const [user, setUser] = React.useState(() => authAPI.getStoredUser());
  const isAuthenticated = Boolean(user) && authAPI.isAuthenticated();

  const handleAuthSuccess = (nextUser) => {
    setUser(nextUser);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />

        {isAuthenticated ? (
          <Navigation onLogout={handleLogout} user={user} />
        ) : null}

        <Routes>
          <Route
            path="/"
            element={
              <AuthPage
                onAuthSuccess={handleAuthSuccess}
                onLogout={handleLogout}
                user={user}
              />
            }
          />
          <Route
            path="/claims"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ClaimsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-claim"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CreateClaim />
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <PolicyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/claims' : '/'} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
