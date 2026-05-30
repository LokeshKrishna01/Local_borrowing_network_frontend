import { useState, useEffect } from 'react';
import { QRCode } from 'react-qr-code';
import { Clock, RefreshCw } from 'lucide-react';

/**
 * QRGenerator
 * @param {string|null} qrData      - JSON string to encode in the QR code (null = not yet generated)
 * @param {string|null} expiresAt   - ISO date string of expiry
 * @param {function} onRegenerate   - callback to (re)generate QR
 * @param {'handover'|'return'} context - determines instruction text shown to user
 */
const QRGenerator = ({ qrData, expiresAt, onRegenerate, context = 'return' }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  // Reset expired state whenever fresh QR data arrives
  useEffect(() => {
    if (qrData) {
      setExpired(false);
    }
  }, [qrData]);

  useEffect(() => {
    if (!expiresAt) return;

    // Immediately compute initial time left (no 1-second blank delay)
    const compute = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry - now;
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft('Expired');
        return false; // stop interval
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      return true;
    };

    compute();
    const interval = setInterval(() => {
      if (!compute()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const instructions =
    context === 'handover'
      ? 'Show this QR code to the borrower so they can scan it to confirm receipt of the item.'
      : 'Show this QR code to the lender so they can scan it to confirm the item has been returned.';

  const generateLabel  = context === 'handover' ? 'Generate Handover QR' : 'Generate Return QR';
  const regenerateLabel = context === 'handover' ? 'Regenerate Handover QR' : 'Regenerate Return QR';

  // --- QR available and not expired ---
  if (qrData && !expired) {
    return (
      <div className="qr-container fade-in">
        <div className="qr-code-wrapper">
          <QRCode
            value={qrData}
            size={220}
            level="H"
            fgColor="#1a1a2e"
            bgColor="#ffffff"
          />
        </div>
        <div className="qr-timer">
          <Clock size={16} />
          Expires in:&nbsp;<span className="time">{timeLeft}</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
          {instructions}
        </p>
      </div>
    );
  }

  // --- Expired ---
  if (expired) {
    return (
      <div className="qr-container fade-in">
        <div className="empty-state">
          <div className="empty-icon">⏰</div>
          <h3>QR Code Expired</h3>
          <p>The QR code has expired. Generate a new one.</p>
          <button
            id={`regen-qr-btn-${context}`}
            className="btn btn-primary"
            onClick={onRegenerate}
          >
            <RefreshCw size={16} /> {regenerateLabel}
          </button>
        </div>
      </div>
    );
  }

  // --- Not yet generated ---
  return (
    <div className="qr-container fade-in">
      <div className="empty-state">
        <div className="empty-icon">📱</div>
        <h3>{generateLabel}</h3>
        <p>Click below to generate a time-sensitive QR code.</p>
        <button
          id={`generate-qr-btn-${context}`}
          className="btn btn-primary"
          onClick={onRegenerate}
        >
          <RefreshCw size={16} /> {generateLabel}
        </button>
      </div>
    </div>
  );
};

export default QRGenerator;
