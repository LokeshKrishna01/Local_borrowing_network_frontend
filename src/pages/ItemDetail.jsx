import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import ConfirmationModal from '../components/ConfirmationModal';
import { User, Star, Calendar, ArrowLeft, Send, MessageSquare, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [borrowing, setBorrowing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data } = await API.get(`/items/${id}`);
      setItem(data);
    } catch (error) {
      toast.error('Item not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      await API.post('/chat/conversation', { recipientId: item.owner._id });
      navigate('/chat');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      return toast.error('Please select both dates');
    }

    setBorrowing(true);
    try {
      await API.post('/transactions/borrow', {
        itemId: id,
        startDate,
        endDate,
      });
      toast.success('Borrow request sent! Waiting for lender approval.');
      navigate('/my-borrowings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setBorrowing(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Use standard delete if owner, or admin delete if admin
      const deleteUrl = user.role === 'admin' ? `/admin/items/${id}` : `/items/${id}`;
      await API.delete(deleteUrl);
      toast.success('Item deleted');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!item) return null;

  const isOwner = item.owner?._id === user?._id;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page fade-in">
      <div className="container">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="detail-layout">
          <div className="detail-image">
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={(e) => {
                e.target.src = 'https://placehold.co/600x400/1a1a2e/6c63ff?text=No+Image';
              }}
            />
          </div>

          <div className="detail-info">
            <span className={`badge badge-${item.status}`} style={{ marginBottom: 'var(--space-md)', display: 'inline-flex' }}>
              {item.status}
            </span>
            <h1>{item.title}</h1>
            <p className="category">{item.category}</p>
            <p className="description">{item.description}</p>

            <div className="detail-meta">
              <div className="detail-meta-row">
                <span className="label"><User size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> Owner</span>
                <span className="value">{item.owner?.name}</span>
              </div>
              <div className="detail-meta-row">
                <span className="label"><Star size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> Reputation</span>
                <span className="value" style={{ color: 'var(--warning)' }}>{item.owner?.reputationScore}</span>
              </div>
              <div className="detail-meta-row">
                <span className="label"><Calendar size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> Listed</span>
                <span className="value">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Borrow form — only for non-owners on available items */}
            {!isOwner && item.status === 'available' && (
              <div className="borrow-form">
                <h3>
                  <Calendar size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                  Request to Borrow
                </h3>
                <form onSubmit={handleBorrow} id="borrow-form">
                  <div className="date-row">
                    <div className="form-group">
                      <label htmlFor="start-date">Start Date</label>
                      <input
                        id="start-date"
                        type="date"
                        className="form-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={today}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="end-date">End Date</label>
                      <input
                        id="end-date"
                        type="date"
                        className="form-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || today}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    disabled={borrowing}
                    id="submit-borrow-btn"
                  >
                    <Send size={16} />
                    {borrowing ? 'Sending Request...' : 'Send Borrow Request'}
                  </button>
                </form>
              </div>
            )}

            {/* Message Owner Button */}
            {!isOwner && (
              <button 
                className="btn btn-secondary btn-lg" 
                style={{ width: '100%', marginTop: 'var(--space-md)' }}
                onClick={handleMessage}
              >
                <MessageSquare size={16} /> Message Owner
              </button>
            )}

            {isOwner && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', color: 'var(--info)', fontSize: '0.9rem' }}>
                  This is your item. You can manage it from <a href="/my-items" style={{ color: 'var(--primary-light)' }}>My Items</a>.
                </div>
                <button
                  className="btn btn-danger btn-lg"
                  style={{ width: '100%' }}
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={item.status === 'borrowed'}
                  title={item.status === 'borrowed' ? 'Cannot delete while borrowed' : 'Delete item'}
                >
                  <Trash2 size={16} /> Delete My Item
                </button>
              </div>
            )}

            {!isOwner && user?.role === 'admin' && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <button
                  className="btn btn-danger btn-lg"
                  style={{ width: '100%' }}
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={item.status === 'borrowed'}
                  title={item.status === 'borrowed' ? 'Cannot delete while borrowed' : 'Delete item (Admin)'}
                >
                  <Trash2 size={16} /> Delete Item (Admin)
                </button>
              </div>
            )}

            {item.status === 'borrowed' && !isOwner && user?.role !== 'admin' && (
              <div style={{ padding: '1rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', color: 'var(--warning)', fontSize: '0.9rem' }}>
                This item is currently borrowed and unavailable.
              </div>
            )}
          </div>
        </div>

        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Yes, Delete"
          type="danger"
        />
      </div>
    </div>
  );
};

export default ItemDetail;
