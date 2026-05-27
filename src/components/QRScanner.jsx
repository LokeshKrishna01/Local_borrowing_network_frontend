import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, XCircle, AlertTriangle } from 'lucide-react';

const QR_ELEMENT_ID = 'qr-reader';

// Responsive qrbox: smaller on mobile screens
const getQrBoxSize = () => {
  const width = window.innerWidth;
  if (width < 400) return { width: 180, height: 180 };
  if (width < 600) return { width: 220, height: 220 };
  return { width: 250, height: 250 };
};

const QRScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const html5QrRef = useRef(null);
  // Guard flag to prevent double-init from React 18 StrictMode
  const isStartingRef = useRef(false);

  // Detect if the page is running over HTTP (camera won't work on mobile)
  const isInsecure =
    typeof window !== 'undefined' &&
    window.location.protocol === 'http:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  const stopScanner = useCallback(async () => {
    isStartingRef.current = false;
    if (html5QrRef.current) {
      try {
        if (html5QrRef.current.isScanning) {
          await html5QrRef.current.stop();
        }
        await html5QrRef.current.clear();
      } catch {
        // Ignore stop/clear errors — element may already be gone
      }
      html5QrRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (!scanning) return;
    // Prevent double-start (React 18 StrictMode fires effects twice in dev)
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    const startScanner = async () => {
      try {
        const html5Qr = new Html5Qrcode(QR_ELEMENT_ID);
        html5QrRef.current = html5Qr;

        const qrboxSize = getQrBoxSize();

        const config = {
          fps: 10,
          qrbox: qrboxSize,
          // Do NOT set aspectRatio — it causes crashes on many Android devices
          rememberLastUsedCamera: true,
        };

        const onDecodeSuccess = (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.transactionId && data.secret) {
              stopScanner();
              onScan(data);
            }
          } catch {
            // Non-JSON QR code — ignore and keep scanning
          }
        };

        const onDecodeError = () => {
          // Frame did not contain a QR code — normal, ignore
        };

        // Try rear camera first (environment), fall back to any camera
        try {
          await html5Qr.start(
            { facingMode: 'environment' },
            config,
            onDecodeSuccess,
            onDecodeError
          );
        } catch (envErr) {
          // Rear camera failed (common on iOS WebView / some browsers)
          // Fall back to letting the browser pick any available camera
          try {
            await html5Qr.start(
              { facingMode: 'user' },
              config,
              onDecodeSuccess,
              onDecodeError
            );
          } catch (fallbackErr) {
            throw fallbackErr; // Both failed — propagate
          }
        }
      } catch (err) {
        isStartingRef.current = false;
        html5QrRef.current = null;

        // Produce a human-readable error for common mobile issues
        let message = 'Failed to start camera.';
        const raw = err?.message || '';
        if (raw.toLowerCase().includes('permission') || raw.toLowerCase().includes('denied')) {
          message = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (raw.toLowerCase().includes('notfound') || raw.toLowerCase().includes('no camera')) {
          message = 'No camera found on this device.';
        } else if (raw.toLowerCase().includes('https') || raw.toLowerCase().includes('secure')) {
          message = 'Camera requires a secure (HTTPS) connection.';
        } else if (raw) {
          message = raw;
        }

        setPermissionError(message);
        onError?.(message);
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrRef.current) {
        (async () => {
          try {
            if (html5QrRef.current?.isScanning) {
              await html5QrRef.current.stop();
            }
            await html5QrRef.current?.clear();
          } catch {
            // Ignore
          }
          html5QrRef.current = null;
          isStartingRef.current = false;
        })();
      }
    };
  }, [scanning, onScan, onError, stopScanner]);

  const handleStart = () => {
    setPermissionError(null);
    setScanning(true);
  };

  const handleStop = () => {
    stopScanner();
  };

  // Warn the user if the page is served over HTTP on a non-local host
  if (isInsecure) {
    return (
      <div className="qr-scanner-error">
        <AlertTriangle size={40} />
        <h3>HTTPS Required</h3>
        <p>
          Camera access requires a secure connection (HTTPS). Please open this
          app over HTTPS to use the QR scanner.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {!scanning ? (
        <div className="empty-state">
          {permissionError ? (
            <>
              <div className="empty-icon">
                <AlertTriangle size={40} style={{ color: 'var(--error)' }} />
              </div>
              <h3 style={{ color: 'var(--error)' }}>Camera Error</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {permissionError}
              </p>
              <button
                id="retry-qr-scanner-btn"
                className="btn btn-primary"
                onClick={handleStart}
              >
                <Camera size={18} /> Retry
              </button>
            </>
          ) : (
            <>
              <div className="empty-icon">📷</div>
              <h3>Scan QR Code</h3>
              <p>Point your camera at the QR code to verify the transaction.</p>
              <button
                id="start-qr-scanner-btn"
                className="btn btn-primary btn-lg"
                onClick={handleStart}
              >
                <Camera size={18} /> Start Scanner
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="qr-scanner-active">
          <div className="scanner-wrapper">
            {/* html5-qrcode mounts its video element here */}
            <div id={QR_ELEMENT_ID}></div>
          </div>
          <p className="qr-scanner-hint">
            Hold the QR code steady inside the frame
          </p>
          <div style={{ textAlign: 'center' }}>
            <button
              id="stop-qr-scanner-btn"
              className="btn btn-secondary"
              onClick={handleStop}
            >
              <XCircle size={16} /> Stop Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
