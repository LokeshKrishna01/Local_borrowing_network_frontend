import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import QRGenerator from '../components/QRGenerator';
import ConfirmationModal from '../components/ConfirmationModal';
import { ArrowLeftRight, Package, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const MyBorrowings = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeQR, setActiveQR] = useState(null);  // transactionId whose QR modal is open
  const [qrMap, setQrMap] = useState({});           // { [transactionId]: { qrData, expiresAt } }
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState({ open: false, txnId: null });

  const filters = ['all', 'pending', 'active', 'completed', 'rejected', 'cancelled'];

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      const { data } = await API.get('/transactions/my-borrowings');
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (transactionId) => {
    try {
      const { data } = await API.post(`/transactions/${transactionId}/generate-qr`);
      // Store QR data keyed by transactionId BEFORE opening the modal
      setQrMap((prev) => ({
        ...prev,
        [transactionId]: { qrData: data.qrData, expiresAt: data.expiresAt },
      }));
      setActiveQR(transactionId);
      toast.success('QR code generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR');
    }
  };

  const handleCancel = async () => {
    const transactionId = cancelModal.txnId;
    try {
      await API.delete(`/transactions/${transactionId}/cancel`);
      toast.success('Borrow request cancelled');
      fetchBorrowings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.status === filter);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="page-header">
          <h1>My Borrowings</h1>
          <p>Track items you've requested or borrowed</p>
        </div>

        <div className="tab-filter">
          {filters.map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><ArrowLeftRight size={48} /></div>
            <h3>No Borrowings Yet</h3>
            <p>No borrowing has been made yet. Browse the dashboard to find items to borrow!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Package size={48} /></div>
            <h3>No Results</h3>
            <p>No borrowings match the <strong>{filter}</strong> filter.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {filtered.map((txn) => (
              <div key={txn._id} className="transaction-card" id={`borrowing-${txn._id}`}>
                <div className="item-thumb">
                  <img
                    src={txn.item?.imageUrl}
                    alt={txn.item?.title}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/100x100/1a1a2e/6c63ff?text=Item';
                    }}
                  />
                </div>
                <div className="info">
                  <h4>{txn.item?.title || 'Item'}</h4>
                  <p className="dates">
                    {new Date(txn.startDate).toLocaleDateString()} → {new Date(txn.endDate).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Lender: {txn.lender?.name}
                  </p>
                </div>
                <span className={`badge badge-${txn.status}`}>{txn.status}</span>
                {txn.status === 'active' && (
                  <div className="actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleGenerateQR(txn._id)}
                    >
                      Generate Return QR
                    </button>
                  </div>
                )}
                {txn.status === 'approved' && (
                  <div className="actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--info)' }}>Scan lender's QR to confirm receipt</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setCancelModal({ open: true, txnId: txn._id })}
                      >
                        Cancel Request
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/handover/${txn._id}`)}
                      >
                        <QrCode size={14} /> Confirm Receipt
                      </button>
                    </div>
                  </div>
                )}
                {txn.status === 'pending' && (
                  <div className="actions">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setCancelModal({ open: true, txnId: txn._id })}
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* QR Code Modal */}
        {activeQR && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setActiveQR(null)}
          >
            <div
              className="glass-card"
              style={{ maxWidth: '400px', width: '90%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Return QR Code</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Show this to the lender when returning the item.
                </p>
              </div>
              <QRGenerator
                qrData={qrMap[activeQR]?.qrData}
                expiresAt={qrMap[activeQR]?.expiresAt}
                onRegenerate={() => handleGenerateQR(activeQR)}
                context="return"
              />
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => setActiveQR(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={cancelModal.open}
          onClose={() => setCancelModal({ open: false, txnId: null })}
          onConfirm={handleCancel}
          title="Cancel Borrow Request"
          message="Are you sure you want to cancel this borrow request? This action cannot be undone."
          confirmText="Yes, Cancel Request"
          type="danger"
        />
      </div>
    </div>
  );
};

export default MyBorrowings;
