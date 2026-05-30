import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ArrowLeftRight,
  ClipboardList,
  Shield,
  LogOut,
  Menu,
  X,
  Star,
  Bell,
  MessageSquare,
  User
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || user.status !== 'active') return null;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          NeighborGoods
        </Link>

        <button
          className="hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
            <LayoutDashboard size={16} /> Browse
          </NavLink>

          {user.role === 'admin' && (
            <NavLink to="/admin" onClick={() => setMobileOpen(false)}>
              <Shield size={16} /> Admin Panel
            </NavLink>
          )}

          <NavLink to="/my-items" onClick={() => setMobileOpen(false)}>
            <Package size={16} /> My Items
          </NavLink>
          <NavLink to="/add-item" onClick={() => setMobileOpen(false)}>
            <PlusCircle size={16} /> List Item
          </NavLink>
          <NavLink to="/my-borrowings" onClick={() => setMobileOpen(false)}>
            <ArrowLeftRight size={16} /> Borrowings
          </NavLink>
          <NavLink to="/lend-requests" onClick={() => setMobileOpen(false)}>
            <ClipboardList size={16} /> Requests
          </NavLink>
        </div>

        <div className="navbar-user">
          <Link to="/chat" className="nav-notification-bell" title="Messages" style={{ marginRight: 'var(--space-sm)' }}>
            <MessageSquare size={20} />
          </Link>
          <Link to="/notifications" className="nav-notification-bell" title="Notifications">
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </Link>
          {user.role !== 'admin' && (
            <div className="reputation-badge">
              <Star size={12} />
              {user.reputationScore}
            </div>
          )}
          <span className="user-name">{user.name}</span>
          <button onClick={() => navigate('/profile')} className="btn btn-sm btn-secondary" style={{ marginRight: 'var(--space-xs)' }} id="profile-btn">
            <User size={14} /> Profile
          </button>
          <button onClick={handleLogout} className="btn btn-sm btn-secondary" id="logout-btn">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
