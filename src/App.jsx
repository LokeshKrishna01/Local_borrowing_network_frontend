import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PendingScreen from './pages/PendingScreen';
import Dashboard from './pages/Dashboard';
import MyItems from './pages/MyItems';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import ItemDetail from './pages/ItemDetail';
import MyBorrowings from './pages/MyBorrowings';
import LendRequests from './pages/LendRequests';
import ReturnItem from './pages/ReturnItem';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import HandoverItem from './pages/HandoverItem';
import MyProfile from './pages/MyProfile';

import './index.css';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : user.status === 'pending' ? '/pending' : '/dashboard'} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/pending" />} />

        {/* Pending Route */}
        <Route path="/pending" element={
          <ProtectedRoute allowPending>
            <PendingScreen />
          </ProtectedRoute>
        } />

        {/* User Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/my-items" element={
          <ProtectedRoute>
            <MyItems />
          </ProtectedRoute>
        } />
        <Route path="/add-item" element={
          <ProtectedRoute>
            <AddItem />
          </ProtectedRoute>
        } />
        <Route path="/edit-item/:id" element={
          <ProtectedRoute>
            <EditItem />
          </ProtectedRoute>
        } />
        <Route path="/items/:id" element={
          <ProtectedRoute>
            <ItemDetail />
          </ProtectedRoute>
        } />
        <Route path="/my-borrowings" element={
          <ProtectedRoute>
            <MyBorrowings />
          </ProtectedRoute>
        } />
        <Route path="/lend-requests" element={
          <ProtectedRoute>
            <LendRequests />
          </ProtectedRoute>
        } />
        <Route path="/return/:id" element={
          <ProtectedRoute>
            <ReturnItem />
          </ProtectedRoute>
        } />
        <Route path="/handover/:id" element={
          <ProtectedRoute>
            <HandoverItem />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Default */}
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(230, 20%, 15%)',
                color: 'hsl(0, 0%, 95%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                fontSize: '0.9rem',
              },
              success: {
                iconTheme: { primary: 'hsl(150, 60%, 45%)', secondary: 'white' },
              },
              error: {
                iconTheme: { primary: 'hsl(0, 70%, 55%)', secondary: 'white' },
              },
            }}
          />
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
