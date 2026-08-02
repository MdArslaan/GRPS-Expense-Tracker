import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

  return children;
};

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav className="navbar glassmorphism">
      <div className="nav-brand">GRPS Tracker</div>
      <div className="nav-links">
        {user.role === 'admin' ? (
          <>
            <Link to="/admin" className="nav-link">Admin Dashboard</Link>
            <Link to="/" className="nav-link">Worker Mode</Link>
          </>
        ) : (
          <span className="nav-role">Worker Mode</span>
        )}
        <div className="user-info">
          <span className="username">{user.username}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

const AppContent = () => {
  return (
    <Router>
      <div className="app-layout">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <WorkerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
