import React from 'react';
import { Download, Printer, X, QrCode } from 'lucide-react';

interface QrDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
}

export const QrDisplayModal: React.FC<QrDisplayModalProps> = ({ isOpen, onClose, jobId }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content qr-modal">
        <div className="modal-header">
          <h3>Generated QR Label</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="qr-container">
            {/* Mock QR Code representation */}
            <div className="qr-mock">
              <QrCode size={120} strokeWidth={1} color="#1A1D1F" />
              <div className="qr-scan-line"></div>
            </div>
            <h4>{jobId}</h4>
            <p>Scan to track cycle time & process status</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={handlePrint}>
            <Printer size={16} /> Print Label
          </button>
          <button className="primary-btn">
            <Download size={16} /> Download PNG
          </button>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          width: 100%;
          max-width: 400px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        .modal-header {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }
        .modal-header h3 { font-size: 16px; margin: 0; }
        .close-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-secondary);
        }
        .modal-body {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .qr-container {
          background: #f8fafc;
          border: 1px dashed var(--border-color);
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .qr-mock {
          position: relative;
          width: 140px;
          height: 140px;
          background: white;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .qr-scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: var(--accent-red);
          box-shadow: 0 0 8px var(--accent-red);
          top: 0;
          animation: scan 2s infinite linear;
        }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .qr-container h4 { font-size: 18px; margin: 0; letter-spacing: 1px; color: #1e293b; }
        .qr-container p { font-size: 12px; color: var(--text-tertiary); margin: 0; }
        
        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
        }
        .secondary-btn {
          padding: 10px 16px; background: white; border: 1px solid var(--border-color);
          border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; gap: 8px; align-items: center;
        }
        .primary-btn {
          padding: 10px 16px; background: var(--text-primary); color: white; border: none;
          border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; gap: 8px; align-items: center;
        }
      `}</style>
    </div>
  );
};
