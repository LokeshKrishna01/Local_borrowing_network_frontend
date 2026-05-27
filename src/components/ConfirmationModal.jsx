import Modal from './Modal';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  type = 'primary',
  isLoading = false 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirmation-modal-content">
        <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="confirmation-modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className={`btn btn-${type}`} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm"></span> Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
