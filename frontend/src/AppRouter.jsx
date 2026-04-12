import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dialog from './shared/components/Dialog';
import authService from './services/authService';
import Layout from './layout/Layout';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPageSimple from './pages/Dashboard/DashboardPageSimple';
import CompensatePageSimple from './pages/Compensate/CompensatePageSimple';
import MarketplacePageSimple from './pages/Marketplace/MarketplacePageSimple';
import LoyaltyPageSimple from './pages/Loyalty/LoyaltyPageSimple';
import BookingPageSimple from './pages/Booking/BookingPageSimple';
import VouchersPageSimple from './pages/Vouchers/VouchersPageSimple';
import TestingPage from './pages/Testing/TestingPage';

const AppRouterContent = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [compensations, setCompensations] = useState([]);
  const [routes] = useState([
    { id: 1, route: 'NYC → LAX', totalPool: 50000, participants: 234, roi: 8.5 },
    { id: 2, route: 'SFO → ORD', totalPool: 35000, participants: 156, roi: 7.2 },
    { id: 3, route: 'MIA → BOS', totalPool: 28000, participants: 112, roi: 6.8 },
    { id: 4, route: 'ATL → DEN', totalPool: 42000, participants: 198, roi: 9.1 }
  ]);

  // Check if user is already logged in
  useEffect(() => {
    const savedAccount = localStorage.getItem('userAccount');
    if (savedAccount) {
      try {
        const user = JSON.parse(savedAccount);
        // Ensure both _id and id are set
        if (!user._id && user.id) {
          user._id = user.id;
        }
        setAccount(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved account:', error);
        localStorage.removeItem('userAccount');
      }
    }
  }, []);

  const handleLoginSuccess = (userAccount) => {
    setAccount(userAccount);
    setIsAuthenticated(true);
    setDialog({ isOpen: true, title: 'Welcome!', message: `Logged in as ${userAccount.name}\n${userAccount.email}`, type: 'success' });
    navigate('/dashboard', { replace: true });
  };

  const handleRegisterSuccess = (userAccount) => {
    setAccount(userAccount);
    setIsAuthenticated(true);
    setDialog({ 
      isOpen: true, 
      title: 'Account Created!', 
      message: `Welcome to SkyGuard DAO, ${userAccount.name}!\n\nEmail: ${userAccount.email}\n✓ Your account has been saved to the database.`, 
      type: 'success' 
    });
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    authService.logout();
    setAccount(null);
    setIsAuthenticated(false);
    setDialog({ isOpen: true, title: 'Logged Out', message: 'You have been logged out successfully.', type: 'success' });
    navigate('/login', { replace: true });
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : 
            <LoginPage onSwitchToRegister={() => navigate('/register')} onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : 
            <RegisterPage onSwitchToLogin={() => navigate('/login')} onRegisterSuccess={handleRegisterSuccess} />
          } 
        />

        {/* Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout account={account} onLogout={handleLogout}>
                <Navigate to="/dashboard" replace />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout account={account} onLogout={handleLogout}>
                <DashboardPageSimple 
                  account={account} 
                  setDialog={setDialog} 
                  compensations={compensations} 
                  routes={routes}
                  onAccountUpdate={(updatedAccount) => {
                    setAccount(updatedAccount);
                    localStorage.setItem('userAccount', JSON.stringify(updatedAccount));
                  }}
                />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/compensate" 
          element={
            <ProtectedRoute>
              <Layout account={account} onLogout={handleLogout}>
                <CompensatePageSimple account={account} setDialog={setDialog} />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/marketplace" 
          element={
            <ProtectedRoute>
              <Layout account={account} onLogout={handleLogout}>
                <MarketplacePageSimple account={account} setDialog={setDialog} />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/vouchers" 
          element={
            <ProtectedRoute>
              <Layout account={account} onLogout={handleLogout}>
                <VouchersPageSimple account={account} setDialog={setDialog} compensations={compensations} />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/booking" 
          element={
            <ProtectedRoute>
              <Layout account={account} onLogout={handleLogout}>
                <BookingPageSimple account={account} setDialog={setDialog} />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/loyalty" 
          element={
            <ProtectedRoute>
              <Layout account={account} onLogout={handleLogout}>
                <LoyaltyPageSimple account={account} setDialog={setDialog} />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/testing" 
          element={
            <ProtectedRoute>
              <Layout account={account} onLogout={handleLogout}>
                <TestingPage account={account} setDialog={setDialog} />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to dashboard if authenticated, login if not */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>

      {/* Global Dialog */}
      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </>
  );
};

const AppRouter = () => {
  return (
    <Router>
      <AppRouterContent />
    </Router>
  );
};

export default AppRouter;
