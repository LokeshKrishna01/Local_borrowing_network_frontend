import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import QRScanner from '../components/QRScanner';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ReturnItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleScan = async (data) => {
    if (data.transactionId !== id) {
      toast.error('QR code does not match this transaction');
      return;
    }

    // Reject handover QR codes on the return page
    if (data.type === 'handover') {
      toast.error('This is a handover QR code, not a return QR code');
      return;
    }

    setVerifying(true);
    try {
      await API.post(`/transactions/${id}/verify-return`, {
        secret: data.secret,
      });
      setCompleted(true);
      toast.success('Return verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleError = (message) => {
    toast.error(`Scanner error: ${message}`);
  };

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '600px' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1>Verify Return</h1>
          <p>Scan the borrower's QR code to confirm the item has been returned</p>
        </div>

        <div className="glass-card">
          {completed ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'var(--success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
              }}>
                <CheckCircle size={40} />
              </div>
              <h3 style={{ color: 'var(--success)' }}>Return Verified!</h3>
              <p>The item has been successfully returned and is now available again.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/lend-requests')}
                style={{ marginTop: '1rem' }}
              >
                Back to Requests
              </button>
            </div>
          ) : verifying ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Verifying return...</p>
            </div>
          ) : (
            <QRScanner onScan={handleScan} onError={handleError} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnItem;
