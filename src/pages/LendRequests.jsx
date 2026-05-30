import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import QRGenerator from '../components/QRGenerator';
import ConfirmationModal from '../components/ConfirmationModal';
import { ClipboardList, CheckCircle, XCircle, QrCode, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const LendRequests = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [rejectModal, setRejectModal] = useState({ open: false, txnId: null });
  const [activeQR, setActiveQR] = useState(null);  // transactionId whose QR modal is open
  const [qrMap, setQrMap] = useState({});           // { [transactionId]: { qrData, expiresAt } }
  const navigate = useNavigate();

  const filters = ['all', 'pending', 'active', 'completed', 'rejected'];

  useEffect(() => {
    fetchRequests();
  }, []);

  // Poll for request updates when the QR modal is open
  useEffect(() => {
    if (!activeQR) return;

    const interval = setInterval(() => {
      fetchRequests();
    }, 3000); // poll every 3 seconds

    return () => clearInterval(interval);
  }, [activeQR]);

  // Auto-close QR modal if the handover is completed
  useEffect(() => {
    if (!activeQR) return;
    const currentTxn = transactions.find((t) => t._id === activeQR);
    if (currentTxn && currentTxn.status === 'active') {
      setActiveQR(null);
      toast.success('Handover confirmed! The borrower has received the item.');
    }
  }, [transactions, activeQR]);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/transactions/lend-requests');
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/transactions/${id}/approve`);
      toast.success('Request approved! Now generate a handover QR code for the borrower.');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleGenerateHandoverQR = async (transactionId) => {
    try {
      const { data } = await API.post(`/transactions/${transactionId}/generate-handover-qr`);
      // Store QR data keyed by transactionId BEFORE opening modal so it appears immediately
      setQrMap((prev) => ({
        ...prev,
        [transactionId]: { qrData: data.qrData, expiresAt: data.expiresAt },
      }));
      setActiveQR(transactionId);
      toast.success('Handover QR code generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR');
    }
  };

  const handleReject = async () => {
    const id = rejectModal.txnId;
    try {
      await API.put(`/transactions/${id}/reject`);
      toast.success('Request rejected');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
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
          <h1>Lend Requests</h1>
          <p>Manage borrow requests for your items</p>
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

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><ClipboardList size={48} /></div>
            <h3>No Requests</h3>
            <p>No borrow requests found for this filter.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {filtered.map((txn) => (
              <div key={txn._id} className="transaction-card" id={`request-${txn._id}`}>
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Borrower: {txn.borrower?.name}
                    <span style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.5rem' }}>
                      <Star size={12} /> {txn.borrower?.reputationScore}
                    </span>
                  </p>
                </div>
                <span className={`badge badge-${txn.status}`}>{txn.status}</span>
                <div className="actions">
                  {txn.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleApprove(txn._id)}
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setRejectModal({ open: true, txnId: txn._id })}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                  {txn.status === 'approved' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--info)' }}>Awaiting physical handover</span>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleGenerateHandoverQR(txn._id)}
                      >
                        <QrCode size={14} /> Handover QR
                      </button>
                    </div>
                  )}
                  {txn.status === 'active' && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate(`/return/${txn._id}`)}
                    >
                      <QrCode size={14} /> Scan Return QR
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <ConfirmationModal
          isOpen={rejectModal.open}
          onClose={() => setRejectModal({ open: false, txnId: null })}
          onConfirm={handleReject}
          title="Reject Borrow Request"
          message="Are you sure you want to reject this borrow request?"
          confirmText="Yes, Reject"
          type="danger"
        />

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
                <h3 style={{ marginBottom: '0.5rem' }}>Handover QR Code</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Ask the borrower to scan this to confirm they received the item.
                </p>
              </div>
              <QRGenerator
                qrData={qrMap[activeQR]?.qrData}
                expiresAt={qrMap[activeQR]?.expiresAt}
                onRegenerate={() => handleGenerateHandoverQR(activeQR)}
                context="handover"
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
      </div>
    </div>
  );
};

export default LendRequests;
