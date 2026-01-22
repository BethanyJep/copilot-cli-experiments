import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './BarcodeScanner.css';

export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Starting camera...');
  const [isReady, setIsReady] = useState(false);
  const scannerRef = useRef(null);
  const stoppedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch (e) {
        // Ignore stop errors
      }
    }
  }, []);

  useEffect(() => {
    const scannerId = 'barcode-scanner';
    let mounted = true;
    
    const initScanner = async () => {
      try {
        // Configure to avoid deprecated unload listeners
        const scanner = new Html5Qrcode(scannerId, {
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: false
          }
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { 
            fps: 10, 
            qrbox: { width: 250, height: 150 },
            rememberLastUsedCamera: false,
          },
          (decodedText) => {
            if (!mounted || stoppedRef.current) return;
            
            const cleaned = decodedText.replace(/[-\s]/g, '');
            const isValid = /^97[89]\d{10}$/.test(cleaned) || 
                           /^\d{9}[\dXx]$/.test(cleaned) || 
                           /^\d{13}$/.test(cleaned);
            
            if (isValid) {
              stoppedRef.current = true;
              scanner.stop().then(() => {
                onScan(cleaned);
              }).catch(() => {
                onScan(cleaned);
              });
            }
          },
          () => {}
        );

        if (mounted) {
          setIsReady(true);
          setStatus('Point at ISBN barcode');
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to start camera');
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [onScan, stopScanner]);

  const handleClose = () => {
    stopScanner().then(() => onClose());
  };

  const handleCapture = async () => {
    if (!isReady) return;
    setStatus('Analyzing...');
    
    try {
      const video = document.querySelector('#barcode-scanner video');
      if (!video) {
        setStatus('Camera not ready');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/png');
      
      // Stop current scanner first
      await stopScanner();
      
      // Create new scanner instance for file scanning
      const fileScanner = new Html5Qrcode('file-scan-temp', { verbose: false });
      
      try {
        // Convert data URL to File
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'scan.png', { type: 'image/png' });
        
        const result = await fileScanner.scanFile(file, true);
        const cleaned = result.replace(/[-\s]/g, '');
        
        if (/^97[89]\d{10}$/.test(cleaned) || /^\d{9}[\dXx]$/.test(cleaned) || /^\d{13}$/.test(cleaned)) {
          onScan(cleaned);
        } else {
          setStatus('Not a valid ISBN');
        }
      } catch {
        setStatus('No barcode found. Try again.');
        // Restart by closing and letting user reopen
        onClose();
      } finally {
        fileScanner.clear();
      }
    } catch (err) {
      setStatus('Capture failed');
    }
  };

  return (
    <div className="scanner-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="scanner-container">
        <div className="scanner-header">
          <h3>Scan ISBN Barcode</h3>
          <button className="close-btn" onClick={handleClose} type="button">×</button>
        </div>
        
        {error ? (
          <div className="scanner-error">
            <p>{error}</p>
            <p>Make sure camera permissions are granted.</p>
          </div>
        ) : (
          <>
            <div id="barcode-scanner" className="scanner-viewport"></div>
            <div id="file-scan-temp" style={{ display: 'none' }}></div>
            <button className="capture-btn" onClick={handleCapture} type="button" disabled={!isReady}>
              📸 Capture & Scan
            </button>
          </>
        )}
        
        <p className="scanner-hint">{status}</p>
      </div>
    </div>
  );
}
