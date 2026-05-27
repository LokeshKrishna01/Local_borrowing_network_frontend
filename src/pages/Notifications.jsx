import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { 
  Bell, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  RefreshCcw, 
  ShieldAlert,
  Clock
} from 'lucide-react';

const Notifications = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'request': return <MessageSquare size={20} className="text-primary" />;
      case 'approval': return <CheckCircle size={20} className="text-success" />;
      case 'rejection': return <XCircle size={20} className="text-error" />;
      case 'return': return <RefreshCcw size={20} className="text-info" />;
      case 'admin_alert': return <ShieldAlert size={20} className="text-warning" />;
      default: return <Bell size={20} />;
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    if (n.link) navigate(n.link);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your borrowing and lending activity</p>
          </div>
          {notifications.length > 0 && (
            <button className="btn btn-sm btn-secondary" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state glass-card">
            <div className="empty-icon"><Bell size={48} /></div>
            <h3>No notifications yet</h3>
            <p>We'll notify you when someone interacts with your items or requests.</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className={`icon ${n.type}`}>
                  {getIcon(n.type)}
                </div>
                <div className="content">
                  <p style={{ fontWeight: !n.isRead ? '600' : '400' }}>{n.message}</p>
                  <div className="time">
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                {!n.isRead && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
