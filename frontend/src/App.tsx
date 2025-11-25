import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Securities from './pages/Securities';
import Operations from './pages/Operations';
import Configuration from './pages/Configuration';
import Clients from './pages/Clients';
import Accounts from './pages/Accounts';
import ClientConfig from './pages/config/ClientConfig';
import ProductConfig from './pages/config/ProductConfig';
import MarketConfig from './pages/config/MarketConfig';
import SecurityConfig from './pages/config/SecurityConfig';
import BatchMonitor from './pages/admin/BatchMonitor';
import ProcessQueue from './pages/workflow/ProcessQueue';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/securities"
            element={
              <ProtectedRoute>
                <Securities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations"
            element={
              <ProtectedRoute>
                <Operations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuration"
            element={
              <ProtectedRoute>
                <Configuration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuration/clients"
            element={
              <ProtectedRoute>
                <ClientConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuration/products"
            element={
              <ProtectedRoute>
                <ProductConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuration/markets"
            element={
              <ProtectedRoute>
                <MarketConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuration/security"
            element={
              <ProtectedRoute>
                <SecurityConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/batch-monitor"
            element={
              <ProtectedRoute>
                <BatchMonitor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-approvals"
            element={
              <ProtectedRoute>
                <ProcessQueue />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
