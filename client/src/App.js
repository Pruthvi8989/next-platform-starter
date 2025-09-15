import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashboardDetail from './components/DashboardDetail';
import Accounts from './components/Accounts';
import Bills from './components/Bills';
import Statements from './components/Statements';
import Settings from './components/Settings';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/:id" element={<DashboardDetail />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="bills" element={<Bills />} />
            <Route path="statements" element={<Statements />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;