import { useAuth } from '../context/AuthContext';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PendingScreen = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    await refreshUser();
    const updatedUser = JSON.parse(localStorage.getItem('ng_user'));
    if (updatedUser?.status === 'active') {
      toast.success('Your account has been approved!');
      navigate('/dashboard');
    } else {
      toast('Still pending. Check back in a bit!', { icon: '⏳' });
    }
  };

  return (
    <div className="pending-page">
      <div className="pending-card glass-card fade-in">
        <div className="pending-icon">
          <Clock size={36} />
        </div>
        <h2>Verification in Progress</h2>
        <p>
          Hi <strong>{user?.name}</strong>, your account is currently under review.
          The administrator will verify your identity and grant access shortly.
          Please check back in a few minutes.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleRefresh} id="check-status-btn">
            <RefreshCw size={16} /> Check Status
          </button>
          <button className="btn btn-secondary" onClick={handleLogout} id="pending-logout-btn">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingScreen;
