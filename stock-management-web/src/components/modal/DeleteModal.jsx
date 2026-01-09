import React from 'react';
import Modal from './Modal';
import Button from '../Button';
import { FaExclamationTriangle } from 'react-icons/fa';

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = '',
  message = 'Are you sure you want to delete this item?',
  loading = false,
  title = 'Confirm Deletion',
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const displayMessage = itemName 
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="flex flex-col items-center space-y-6 py-4">
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
          <FaExclamationTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-gray-700 text-base leading-relaxed">
            {displayMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 w-full pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
            type="button"
          >
            No, Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            className="flex-1"
            type="button"
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;

